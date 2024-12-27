import Groq from "groq-sdk";
import { GROQ_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";

if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not defined");

const client = new Groq({
    apiKey: GROQ_API_KEY
});

export async function POST({ request }) {
    try {
        const { messages } = await request.json(); // Changed 'message' to 'messages'
        console.log("Incoming messages:", messages);

        if (!messages || !Array.isArray(messages)) {
            throw new Error("Invalid input: 'messages' must be an array of role/content objects.");
        }

        const response = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a project lead generator that generates highly engaging leads for businesses."
                },
                ...messages
            ],
            model: "llama3-8b-8192",
            stream: true,
        });

        return new Response(
            new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of response) {
                            const content = chunk.choices[0]?.delta?.content || "";
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                        controller.close();
                    } catch (error) {
                        console.error("Streaming error:", error);
                        controller.error(error);
                    }
                }
            }),
            {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-cache"
                }
            }
        );
    } catch (error) {
        console.error("Request error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: error.message.includes("Invalid input") ? 400 : 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
