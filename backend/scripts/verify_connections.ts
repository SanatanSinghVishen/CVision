import "dotenv/config";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

async function main() {
    console.log("Checking connections...");

    // 1. Check Groq
    if (!process.env.GROQ_API_KEY) {
        console.error("❌ GROQ_API_KEY is missing in environment.");
    } else {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: "Ping" }],
                model: "llama-3.3-70b-versatile",
            });
            console.log("✅ Groq Connection: Success");
        } catch (error: any) {
            console.error("❌ Groq Connection Failed:", error.message);
        }
    }

    // 2. Check Supabase (using backend env vars)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Supabase keys missing. (Checked SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)");
    } else {
        try {
            const supabase = createClient(
                supabaseUrl,
                supabaseKey
            );
            const { data, error } = await supabase.from("resumes").select("count", { count: "exact", head: true });

            if (error) {
                // If table doesn't exist, it might error, but connection is technically okay if it's a 404/42P01 on the table level
                // But we want to ensure the table DOES exist for the app to work.
                console.error("❌ Supabase Connection/Table Check Failed:", error.message);
            } else {
                console.log("✅ Supabase Connection: Success (Table 'resumes' found)");
            }
        } catch (error: any) {
            console.error("❌ Supabase Initialization Failed:", error.message);
        }
    }
}

main();
