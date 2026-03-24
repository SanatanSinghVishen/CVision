import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.error("Missing GROQ_API_KEY");
    process.exit(1);
}

const groq = new Groq({ apiKey });

async function main() {
    console.log("Testing Groq Model: llama-3.3-70b-versatile (Text Completion)");

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Ping! Are you receiving this?",
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log("Success!");
        console.log("Response:", completion.choices[0]?.message?.content);
    } catch (error: any) {
        console.error("FAILED.");
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Error Type:", error.type);
        if (error.error) console.error("Full Error Object:", JSON.stringify(error.error, null, 2));
    }
}

main();
