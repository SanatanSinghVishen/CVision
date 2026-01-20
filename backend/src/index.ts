import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeResume } from './services/ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Configure this more strictly for production if needed
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/analyze', async (req, res) => {
    try {
        const { jobTitle, jobDescription, resumeText } = req.body;

        if (!jobTitle || !jobDescription || !resumeText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const feedback = await analyzeResume({
            jobTitle,
            jobDescription,
            resumeText,
        });

        res.json({ feedback });
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
