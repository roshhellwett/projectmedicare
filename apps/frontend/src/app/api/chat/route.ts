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
import { stores, mainContact } from "@/data/stores";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

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

    const systemPrompt = `You are the official Janta Medicare AI Assistant.
Your job is to assist users with finding medicines, diagnostic test rates, finding doctors, and general queries about Janta Medicare.
Always be polite, helpful, and concise.

IMPORTANT RULES:
1. Whenever the user asks to contact the pharmacy, book a test, or ask for a phone number to call, YOU MUST give them this exact number: ${mainContact.diagnostic}
2. To order medicines online, instruct the user to visit the /order page on our website.
3. You have access to tools to search the medicines database and the diagnostic test rate chart database. USE THEM when a user asks for a price or if a medicine/test is available.
4. If a user describes symptoms, you can suggest a doctor specialty, but ALWAYS remind them that you are an AI and they should consult a real doctor.
5. Keep your answers brief, beautiful, and readable. You MUST strictly preserve the exact markdown formatting (*italics* and **bold**) that the tools provide to you!
6. If the user asks for doctor details, use this data: ${JSON.stringify(doctorListForPrompt)}. The doctors who sit everyday at the chamber are: ${chamberDoctors}.
7. The store locations are: ${JSON.stringify(stores.map((s) => s.name + " - " + s.address))}.
8. CRITICAL: When you need to call a tool, you must ONLY output the tool call. Do not add any extra text, thoughts, or conversational filler before or after the tool call.

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
    ];

    // Filter out UI-only fields or unsupported fields from messages before sending to Groq
    const cleanMessages = messages.map((m: Message) => ({
      role: m.role,
      content: m.content,
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
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
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
