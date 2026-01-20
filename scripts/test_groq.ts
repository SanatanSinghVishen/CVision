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
    console.log("Testing Groq Model: meta-llama/llama-4-scout-17b-16e-instruct");

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Describe this image." },
                        {
                            type: "image_url",
                            image_url: {
                                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                            },
                        },
                    ],
                },
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
