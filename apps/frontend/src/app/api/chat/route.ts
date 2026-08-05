/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { groq } from "@ai-sdk/groq";
import { streamText, tool } from "ai";
import { getMedicines, getRates } from "@/lib/data";
import { z } from "zod";
import { doctors, doctorChamberInfo } from "@/data/doctors";
import { stores, mainContact } from "@/data/stores";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are the official Janta Medicare AI Assistant.
Your job is to assist users with finding medicines, diagnostic test rates, finding doctors, and general queries about Janta Medicare.
Always be polite, helpful, and concise.

IMPORTANT RULES:
1. Whenever the user asks to contact the pharmacy, book a test, or ask for a phone number to call, YOU MUST give them this exact number: ${mainContact.diagnostic}
2. You have access to tools to search the medicines database and the diagnostic test rate chart database. USE THEM when a user asks for a price or if a medicine/test is available.
3. If a user describes symptoms, you can suggest a doctor specialty, but ALWAYS remind them that you are an AI and they should consult a real doctor.
4. Keep your answers brief and readable. Use bullet points if listing multiple items.
5. If the user asks for doctor details, use this data: ${JSON.stringify(doctors)}. The main doctor chamber is ${doctorChamberInfo.name} located at the Shibpur Main Hub.
6. The store locations are: ${JSON.stringify(stores.map((s) => s.name + " - " + s.address))}.

When using tools, summarize the result nicely. E.g., "Yes, we have Crocin available. The MRP is ₹15, but our Janta price is ₹12."`;

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages,
      system: systemPrompt,
      maxTokens: 500,
      tools: {
        search_medicines: tool({
          description:
            "Search for medicines by name to get their availability, pack size, MRP, and Janta selling price.",
          parameters: z.object({
            query: z.string().describe("The name of the medicine to search for"),
          }),
          execute: async ({ query }) => {
            const { items } = await getMedicines(query, 1, {
              key: "medicine_name",
              dir: "asc",
            });
            return items.slice(0, 5); // Return top 5 matches
          },
        }),
        search_rate_chart: tool({
          description:
            "Search for diagnostic tests by name to get their Janta rate/price.",
          parameters: z.object({
            query: z
              .string()
              .describe(
                "The name of the diagnostic test or pathology test to search for",
              ),
          }),
          execute: async ({ query }) => {
            const { items } = await getRates(query, 1, {
              key: "test_name",
              dir: "asc",
            });
            return items.slice(0, 5); // Return top 5 matches
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
