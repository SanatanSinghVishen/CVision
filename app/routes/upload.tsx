import { type FormEvent, useState, useEffect } from 'react'
import Navbar from "~/components/Navbar";
import { type MetaFunction, useNavigate } from "react-router";
import { convertPdfToImage, extractTextFromPdf } from "~/lib/pdf2img";
import { supabase } from "~/lib/supabase";

import { Upload, FileText, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import Button from "~/components/Button";

export const meta: MetaFunction = () => {
    return [
        { title: "CVision | Upload Resume" },
        { name: "description", content: "Upload your resume for AI analysis" },
    ];
};

const UploadPage = () => {
    const navigate = useNavigate();
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const steps = [
        { label: "Extracting Text", icon: FileText },
        { label: "Uploading Files", icon: Upload },
        { label: "AI Analysis", icon: Sparkles },
        { label: "Saving Results", icon: CheckCircle2 }
    ];

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData(e.currentTarget);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        setIsProcessing(true);
        setStatusText('Starting Analysis...');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // 2. Convert PDF & Extract Text
            setCurrentStep(0);
            setStatusText('Processing PDF...');
            
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_FILE_SIZE) {
                throw new Error("File exceeds 5MB limit. Please compress your PDF.");
            }
            const imageResult = await convertPdfToImage(file);
            if (!imageResult.file) {
                const errorMsg = imageResult.error || "PDF Conversion Failed";
                throw new Error(errorMsg);
            }
            const resumeText = await extractTextFromPdf(file);

            // 3. Upload to Supabase Storage (Conditionally for Authenticated Users)
            setCurrentStep(1);
            let targetResumeId = crypto.randomUUID(); // Generic valid UUID for Zod bypass
            
            if (session) {
                setStatusText('Uploading Files to Dashboard...');
                const timestamp = Date.now();
                const resumePath = `${session.user.id}/${timestamp}_${file.name}`;
                const imagePath = `${session.user.id}/${timestamp}_${imageResult.file.name}`;

                const { error: resumeError } = await supabase.storage.from('resumes').upload(resumePath, file);
                if (resumeError) throw new Error(`Resume Upload Failed: ${resumeError.message}`);

                const { error: imageError } = await supabase.storage.from('resumes').upload(imagePath, imageResult.file);
                if (imageError) throw new Error(`Image Upload Failed: ${imageError.message}`);

                // 4. Initial DB Insert
                setStatusText('Saving Resume Data...');
                const { data: dbData, error: dbError } = await supabase
                    .from('resumes')
                    .insert({
                        user_id: session.user.id,
                        company_name: companyName,
                        job_title: jobTitle,
                        job_description: jobDescription,
                        resume_path: resumePath,
                        image_path: imagePath,
                        feedback: null
                    })
                    .select()
                    .single();

                if (dbError) throw new Error(`DB Save Failed: ${dbError.message}`);
                targetResumeId = dbData.id;
            } else {
                setStatusText('Guest User: Skipping Storage...');
            }

            // 5. Call AI API
            setCurrentStep(2);
            setStatusText('AI Analyzing...');

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle,
                    jobDescription,
                    resumeText,
                    resumeId: targetResumeId
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AI Analysis Failed: ${response.status} ${errorText}`);
            }

            const { feedback, error: apiError } = await response.json();
            if (apiError) throw new Error(apiError);

            // 6. Navigate to Results
            setCurrentStep(3);
            console.log("Upload: Feedback processed successfully.");

            // 7. Done
            navigate(`/resume/${targetResumeId}`, { state: { feedback, guestMode: !session } });

        } catch (error: any) {
            console.error("Upload Logic Error:", error);
            setStatusText(`Error: ${error.message}`);
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-28 pb-12">
                {isProcessing ? (
                    <ProcessingView steps={steps} currentStep={currentStep} statusText={statusText} />
                ) : (
                    <div className="max-w-6xl mx-auto animate-fade-in-up">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                    Analyze Your Resume
                                </span>
                            </h1>
                            <p className="text-slate-500 text-lg font-medium">Get AI-powered feedback in seconds</p>
                        </div>

                        {/* Split View */}
                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                            {/* Left: Form */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="company-name" className="block text-sm font-bold text-slate-700 mb-2">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        name="company-name"
                                        id="company-name"
                                        placeholder="e.g. Google"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="job-title" className="block text-sm font-bold text-slate-700 mb-2">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        name="job-title"
                                        id="job-title"
                                        placeholder="e.g. Senior Software Engineer"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="job-description" className="block text-sm font-bold text-slate-700 mb-2">
                                        Job Description
                                    </label>
                                    <textarea
                                        name="job-description"
                                        id="job-description"
                                        rows={8}
                                        placeholder="Paste the full job description here..."
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none shadow-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Right: File Drop Zone */}
                            <div className="flex flex-col gap-6">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className={`flex-1 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-8 bg-white ${isDragging
                                        ? 'border-violet-500 bg-violet-50 shadow-inner'
                                        : file
                                            ? 'border-emerald-500 bg-emerald-50 shadow-inner'
                                            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-sm'
                                        }`}
                                >
                                    {file ? (
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <FileText className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <p className="text-slate-900 font-bold mb-1">{file.name}</p>
                                            <p className="text-sm text-slate-500 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                                            <button
                                                type="button"
                                                onClick={() => setFile(null)}
                                                className="mt-4 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                                            >
                                                Remove File
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-violet-600" />
                                            </div>
                                            <p className="text-slate-900 font-bold mb-2">Drop your resume here</p>
                                            <p className="text-sm text-slate-500 font-medium mb-4">or click to browse</p>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                                                className="hidden"
                                                id="file-input"
                                            />
                                            <label htmlFor="file-input">
                                                <span className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors inline-block pointer-events-auto shadow-sm">
                                                    Select PDF
                                                </span>
                                            </label>
                                        </>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={!file}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md font-bold"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Analyze Resume
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
};

// Processing Pipeline Visualization
const ProcessingView = ({ steps, currentStep, statusText }: any) => (
    <div className="max-w-2xl mx-auto text-center mt-12">
        <div className="mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{statusText}</h2>
            <p className="text-slate-500 font-medium">This usually takes 10-20 seconds</p>
        </div>

        <div className="space-y-4">
            {steps.map((step: any, index: number) => {
                const Icon = step.icon;
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isComplete
                            ? 'bg-emerald-50 border-emerald-200'
                            : isCurrent
                                ? 'bg-violet-50 border-violet-200 shadow-sm'
                                : 'bg-white border-slate-200 opacity-50'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isComplete
                            ? 'bg-emerald-500'
                            : isCurrent
                                ? 'bg-violet-500'
                                : 'bg-slate-100'
                            }`}>
                            {isComplete ? (
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                                <Icon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                            )}
                        </div>
                        <span className={`font-bold ${isComplete || isCurrent ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

export default UploadPage;
