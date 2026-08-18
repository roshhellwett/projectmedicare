import { getMedicines, getRates, Medicine, RateTest } from "@/lib/data";

type Message = {
  role: string;
  content: string | null;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};
type ToolCall = {
  id: string;
  type: string;
  function: { name: string; arguments: string };
};
import { getDoctors } from "@/lib/db/doctors";
import { getPharmacyStores } from "@/lib/db/stores";
import { getActiveCamp } from "@/lib/db/camp";
import { getVisibleBulletins } from "@/lib/db/bulletins";
import { getPackages } from "@/lib/db/packages";
import { createPublicClient } from "@/lib/supabase/admin";
import { getDecryptedKey } from "@/lib/utils/settings";

export async function POST(req: Request) {
  try {
    const groqApiKey = (await getDecryptedKey("GROQ_API_KEY")) || process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          error: "AI chat is not configured. Please contact the administrator.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const rawMessages = body.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Sanitize: only allow user/assistant roles, strip everything else
    const messages = rawMessages
      .filter(
        (m: any) =>
          typeof m === "object" &&
          m !== null &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
      .slice(-20); // Limit conversation history to prevent abuse

    const allDoctors = await getDoctors();
    const chamberDoctors = allDoctors
      .filter((d) => d.is_daily_chamber)
      .map((d) => d.name)
      .join(", ");
    const doctorListForPrompt = allDoctors.map((d) => ({
      name: d.name,
      specialty: d.specialty,
      contact: d.contact,
    }));

    const stores = await getPharmacyStores();
    const supabase = createPublicClient();
    const { data: globalSettings } = await supabase?.from("global_settings").select("*") || { data: [] };
    const settingsMap = (globalSettings || []).reduce((acc: any, row: any) => {
      try {
        acc[row.key] = JSON.parse(row.value);
      } catch (e) {
        acc[row.key] = row.value;
      }
      return acc;
    }, {});
    const diagnosticPhone = settingsMap.support_phone?.diagnostic || "+91 9748660309";

    const activeCamp = await getActiveCamp();
    const visibleBulletins = await getVisibleBulletins(5);
    const bulletinsText = visibleBulletins.map(b => `- [${b.kind.toUpperCase()}] ${b.body}`).join("\n");
    const campText = activeCamp ? `We have an active camp: ${activeCamp.title} at ${activeCamp.venue} on ${activeCamp.camp_date}. Fee: ${activeCamp.fee}.` : "No active camps at the moment.";

    const systemPrompt = `You are the official Janta Medicare LLP AI Assistant, a highly intelligent, empathetic, and professional virtual assistant.
Your job is to assist users with finding medicines, checking diagnostic test rates, finding doctors, exploring health packages, and answering general queries about Janta Medicare LLP.
Always be polite, helpful, clear, and concise. Do not use robotic phrasing.

IMPORTANT RULES:
1. Whenever the user asks to contact the pharmacy, book a test, or ask for a phone number to call, YOU MUST give them this exact number: ${diagnosticPhone}
2. To order medicines online, instruct the user to visit the /order page on our website.
3. You have access to real-time tools to search the medicines database, diagnostic test rate chart, and health packages. USE THEM PROACTIVELY when a user asks for prices, availability, or checkups. Do not ask for permission to check; just check and provide the answer.
4. If a user describes symptoms, you can suggest a doctor specialty, but ALWAYS gently remind them that you are an AI and they should consult a real doctor for medical advice.
5. Keep your answers brief, beautiful, and readable. You MUST strictly preserve the exact markdown formatting (*italics* and **bold**) that the tools provide to you!
6. If the user asks for doctor details, use this data: ${JSON.stringify(doctorListForPrompt)}. The doctors who sit everyday at the chamber are: ${chamberDoctors}.
7. The store locations are: ${stores.map(s => s.name).join(", ")}.
8. Active Offers and Notices:
${bulletinsText || "None currently."}
9. Upcoming Events: ${campText}
10. CRITICAL: When you need to call a tool, you must ONLY output the tool call. Do not add any extra text, thoughts, or conversational filler before or after the tool call.

When using tools, summarize the result nicely. E.g., "Yes, we have Crocin available. The MRP is ₹15, but our Janta price is ₹12."`;

    const tools = [
      {
        type: "function",
        function: {
          name: "search_medicines",
          description:
            "Search for medicines by name to get their availability, pack size, MRP, and Janta selling price.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The name of the medicine to search for",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_rate_chart",
          description:
            "Search for diagnostic tests by name to get their Janta rate/price.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "The name of the diagnostic test or pathology test to search for",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_packages",
          description:
            "Search for available health and diagnostic packages to get their tests, market price, and Janta price.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "The name of the package to search for (optional, leave empty to list all)",
              },
            },
          },
        },
      },
    ];

    // Messages are already sanitized above — map to clean format
    const cleanMessages = messages.map((m: any) => ({
      role: m.role as string,
      content: String(m.content || ""),
    }));

    const currentMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...cleanMessages,
    ];

    let finalMessage = null;

    for (let i = 0; i < 3; i++) {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: currentMessages,
            tools: tools,
            tool_choice: "auto",
            parallel_tool_calls: false,
            max_tokens: 500,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Groq API error: ${await res.text()}`);
      }

      const data = await res.json();
      const message = data.choices[0].message;

      currentMessages.push(message);

      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const args = JSON.parse(toolCall.function.arguments);
          let resultData: Record<string, string | number | undefined>[] = [];

          if (toolCall.function.name === "search_medicines") {
            const { items } = await getMedicines(args.query, 1, {
              key: "medicine_name",
              dir: "asc",
            });
            resultData = items.slice(0, 5).map((item: Medicine) => ({
              medicine: `*${item.medicine_name}*`,
              mrp: `**₹${item.mrp}**`,
              janta_price: `**₹${item.selling_price}**`, // Using selling_price instead of undefined janta_selling_price
              pack_size: item.pack_size,
            }));
          } else if (toolCall.function.name === "search_rate_chart") {
            const { items } = await getRates(args.query, 1, {
              key: "test_name",
              dir: "asc",
            });
            resultData = items.slice(0, 5).map((item: RateTest) => ({
              test: `*${item.test_name}*`,
              janta_rate: `**₹${item.jm_rate}**`, // Using jm_rate instead of undefined janta_rate
            }));
          } else if (toolCall.function.name === "search_packages") {
            const allPackages = await getPackages();
            const q = args.query ? args.query.toLowerCase() : "";
            const filtered = q ? allPackages.filter(p => p.name.toLowerCase().includes(q) || p.tests.some(t => t.toLowerCase().includes(q))) : allPackages;
            resultData = filtered.slice(0, 5).map(p => ({
              package: `*${p.name}*`,
              tests_included: p.tests.join(", "),
              market_price: `₹${p.market_price}`,
              janta_price: `**₹${p.janta_price}**`
            }));
          }

          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(resultData),
          });
        }
      } else {
        finalMessage = message;
        break;
      }
    }

    if (!finalMessage) {
      finalMessage = currentMessages[currentMessages.length - 1];
    }

    return new Response(JSON.stringify(finalMessage), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
