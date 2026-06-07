"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const supabase_js_1 = require("@supabase/supabase-js");
const ai_1 = require("./services/ai");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Initialize Supabase Admin client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey)
    : null;
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Rate limiting setup
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later.' }
});
// Zod schema for payload validation
const analyzeSchema = zod_1.z.object({
    companyName: zod_1.z.string().max(200, "Company name is too long (max 200 chars)"),
    jobTitle: zod_1.z.string().max(200, "Job title is too long (max 200 chars)"),
    jobDescription: zod_1.z.string().max(10000, "Job description is too long (max 10000 chars)"),
    resumeText: zod_1.z.string().max(20000, "Resume text is too long (max 20000 chars)"),
    resumeId: zod_1.z.string().uuid("Invalid resume ID format")
});
app.post('/analyze', apiLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const parsedBody = analyzeSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                error: 'Invalid input',
                details: parsedBody.error.issues
            });
        }
        const { companyName, jobTitle, jobDescription, resumeText, resumeId } = parsedBody.data;
        const feedback = yield (0, ai_1.analyzeResume)({
            companyName,
            jobTitle,
            jobDescription,
            resumeText,
        });
        // Update Database directly from Backend safely via Service Role
        if (supabaseAdmin) {
            const { error: dbError } = yield supabaseAdmin
                .from('resumes')
                .update({ feedback, company_name: companyName })
                .eq('id', resumeId);
            if (dbError) {
                console.error("Supabase Admin Update Error:", dbError);
                // We still return the feedback so the UI can at least display it immediately
            }
        }
        else {
            console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. DB update skipped.");
        }
        res.json({ feedback });
    }
    catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}));
app.get('/analyses/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!supabaseAdmin) {
            return res.status(500).json({ error: "Database connection not configured" });
        }
        const { data, error } = yield supabaseAdmin
            .from('resumes')
            .select('id, company_name, job_title, created_at, feedback')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Supabase query error:", error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        // Only send scores if feedback exists to keep it lightweight
        const lightweightData = data.map(item => {
            const fb = item.feedback;
            let lightweightFeedback = null;
            if (fb) {
                lightweightFeedback = {
                    ATS: fb.ATS ? { score: fb.ATS.score } : undefined,
                    content: fb.content ? { score: fb.content.score } : undefined,
                    toneAndStyle: fb.toneAndStyle ? { score: fb.toneAndStyle.score } : undefined,
                    structure: fb.structure ? { score: fb.structure.score } : undefined,
                };
            }
            return Object.assign(Object.assign({}, item), { feedback: lightweightFeedback });
        });
        res.json(lightweightData);
    }
    catch (error) {
        console.error('Fetch analyses error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
