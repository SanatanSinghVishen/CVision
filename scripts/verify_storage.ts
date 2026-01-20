import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorage() {
    console.log('Checking Supabase Storage buckets...');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
        return;
    }

    const resumesBucket = buckets.find(b => b.name === 'resumes');

    if (resumesBucket) {
        console.log('✅ "resumes" bucket found!');
        console.log('   Public:', resumesBucket.public);
        // console.log('   Owner:', resumesBucket.owner);
    } else {
        console.error('❌ "resumes" bucket NOT found.');
        console.log('Existing buckets:', buckets.map(b => b.name).join(', ') || 'None');
    }
}

verifyStorage();
