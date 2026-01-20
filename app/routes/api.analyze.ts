import { type ActionFunctionArgs, data } from "react-router";
import { analyzeResume } from "~/services/ai.server";
import { supabase } from "~/lib/supabase";

export const action = async ({ request }: ActionFunctionArgs) => {
    console.log("API: Analyze request received");

    if (request.method !== "POST") {
        return data({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        console.log("API: Body parsed. Keys:", Object.keys(body));
        const { jobTitle, jobDescription, resumeText, accessToken } = body;

        if (!jobTitle || !jobDescription || !resumeText || !accessToken) {
            console.error("API Error: Missing fields", {
                hasJob: !!jobTitle,
                hasDesc: !!jobDescription,
                hasText: !!resumeText,
                hasToken: !!accessToken
            });
            return data({ error: "Missing required fields" }, { status: 400 });
        }

        console.log("API: Resume Text Length:", resumeText.length);
        console.log("API: Resume Text Preview:", resumeText.substring(0, 100));

        // Verify User (we can't trust the client completely, but for now we trust the token if valid)
        // Since we use a single global supabase client in lib/supabase.ts which is anon,
        // we can use getUser(accessToken) if supported, but actually in supabase-js v2:
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error || !user) {
            console.error("API Error: Auth failed", error);
            return data({ error: "Unauthorized: Invalid Token" }, { status: 401 });
        }

        console.log("API: calling analyzeResume...");
        const feedback = await analyzeResume({
            jobTitle,
            jobDescription,
            resumeText
        });
        console.log("API: analyzeResume success. Feedback keys:", Object.keys(feedback));

        return data({ feedback });
    } catch (error: any) {
        console.error("API Analysis Error:", error);
        return data({ error: `AI Analysis Failed: ${error.message}` }, { status: 500 });
    }
};
