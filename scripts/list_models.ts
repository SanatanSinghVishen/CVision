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
    try {
        console.log("Fetching available models...");
        const { data } = await groq.models.list();

        console.log("\n--- AVAILABLE MODELS ---");
        data.forEach((model) => {
            console.log(`- ${model.id} (Owner: ${model.owned_by})`);
        });
        console.log("------------------------\n");

    } catch (error: any) {
        console.error("Error fetching models:", error.message);
        if (error.error) console.error("Details:", error.error);
    }
}

main();
