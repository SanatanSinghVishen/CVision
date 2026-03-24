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
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
app.use((0, cors_1.default)()); // Configure this more strictly for production if needed
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Rate limiting setup
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per window
    message: { error: 'Too many requests, please try again later.' }
});
// Zod schema for payload validation
const analyzeSchema = zod_1.z.object({
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
        const { jobTitle, jobDescription, resumeText, resumeId } = parsedBody.data;
        const feedback = yield (0, ai_1.analyzeResume)({
            jobTitle,
            jobDescription,
            resumeText,
        });
        // Update Database directly from Backend safely via Service Role
        if (supabaseUrl && supabaseServiceKey) {
            const { error: dbError } = yield supabaseAdmin
                .from('resumes')
                .update({ feedback })
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
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
