import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Checking last 5 resumes...");
    const { data, error } = await supabase
        .from('resumes')
        .select('id, created_at, company_name, job_title, feedback')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching resumes:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No resumes found.");
        return;
    }

    data.forEach(r => {
        const hasFeedback = !!r.feedback;
        const feedbackPreview = hasFeedback ? JSON.stringify(r.feedback).substring(0, 50) + "..." : "NULL";
        console.log(`[${r.created_at}] ID: ${r.id}`);
        console.log(`   Company: ${r.company_name}`);
        console.log(`   Feedback Saved: ${hasFeedback} (${feedbackPreview})`);
        console.log("-------------------------------------------------");
    });
}

main();
