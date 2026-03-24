async function test() {
    try {
        const url = 'https://jqkiaprqpmclogtowdrx.supabase.co/rest/v1/';
        console.log(`Fetching ${url}...`);
        const res = await fetch(url);
        console.log("Status:", res.status);
    } catch (err) {
        console.error("Fetch failed!");
        console.error("Name:", err.name);
        console.error("Message:", err.message);
        if (err.cause) {
            console.error("Cause:", err.cause);
            if (err.cause.code) console.error("Cause Code:", err.cause.code);
        }
    }
}
test();
