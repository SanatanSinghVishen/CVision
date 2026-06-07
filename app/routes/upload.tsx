import { type FormEvent, useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "~/components/Navbar";
import { type MetaFunction, useNavigate } from "react-router";
import { convertPdfToImage, extractTextFromPdf } from "~/lib/pdf2img";
import { supabase } from "~/lib/supabase";
import { Upload, FileText, Sparkles, CheckCircle2, Loader2, X, Building, Briefcase, FileSearch, AlertCircle } from "lucide-react";
import { Card } from "~/components/ui/Card";
import toast from 'react-hot-toast';

export const meta: MetaFunction = () => {
    return [
        { title: "CVision | Analyze Resume" },
        { name: "description", content: "Upload your resume for AI analysis" },
    ];
};

type AnalyzePayload = {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    resumeText: string;
    resumeId: string;
};

const STAGES = {
  uploading: {
    label: 'Uploading your resume...',
    sublabel: 'Securely sending to our servers',
    progress: 15,
  },
  reading: {
    label: 'Reading your resume...',
    sublabel: 'Extracting experience, skills, and projects',
    progress: 35,
  },
  analyzing: {
    label: 'Analyzing for target role...',
    sublabel: 'Matching against the job description',
    progress: 65,
  },
  building: {
    label: 'Building your report...',
    sublabel: 'Generating suggestions and rewrites',
    progress: 85,
  },
};

const UploadPage = () => {
    const navigate = useNavigate();

    // Form State
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    // UI State
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shakeFields, setShakeFields] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // Stream State
    const [streamBuffer, setStreamBuffer] = useState('');
    const [loadingStage, setLoadingStage] = useState<'uploading' | 'reading' | 'analyzing' | 'building'>('uploading');

    // Dynamic STAGES initialization for company name
    const stages = {
        ...STAGES,
        analyzing: {
            ...STAGES.analyzing,
            label: `Analyzing for ${companyName || 'target role'}...`
        }
    };

    // Progressive indicator
    const filledFields = [companyName, jobTitle, file, jobDescription].filter(Boolean).length;
    const isFormValid = companyName && jobTitle && file && jobDescription;

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            toast.success("Resume attached!");
        } else {
            toast.error("Please upload a PDF file.");
        }
    };

    const triggerShake = () => {
        setShakeFields(true);
        setTimeout(() => setShakeFields(false), 500);
    };

    const submitAndPoll = async (payload: AnalyzePayload, token: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        // Step 1 — Submit job, get jobId back immediately
        const submitRes = await fetch(`${apiUrl}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!submitRes.ok) {
            const err = await submitRes.json();
            throw new Error(err.error ?? 'Failed to start analysis');
        }

        const { jobId, resumeId } = await submitRes.json();
        setLoadingStage('analyzing');

        // Step 2 — Poll every 2 seconds until done or failed
        const poll = async (): Promise<void> => {
            const statusRes = await fetch(`${apiUrl}/job/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!statusRes.ok) {
                // If there's a transient network error, wait and try again instead of immediately failing
                await new Promise(resolve => setTimeout(resolve, 2000));
                return poll();
            }
            
            const status = await statusRes.json();

            // Update progress bar based on job progress (0-100)
            if (status.progress) {
                // Approximate stages based on progress
                if (status.progress >= 10 && status.progress < 90) setLoadingStage('analyzing');
                if (status.progress >= 90) setLoadingStage('building');
            }

            if (status.status === 'completed') {
                setLoadingStage('building');
                setTimeout(() => navigate(`/resume/${resumeId}`), 500);
                return;
            }

            if (status.status === 'failed') {
                throw new Error(status.error ?? 'Analysis failed. Please try again.');
            }

            // Still running — poll again in 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
            return poll();
        };

        await poll();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploadError(null);

        if (!isFormValid) {
            triggerShake();
            toast.error("Please fill all required fields.");
            return;
        }

        setIsProcessing(true);
        setLoadingStage('uploading');
        setStreamBuffer('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("You must be signed in to analyze a resume. Please log in first.");
            }

            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_FILE_SIZE) {
                throw new Error("File exceeds 5MB limit. Please compress your PDF.");
            }
            
            const imageResult = await convertPdfToImage(file);
            if (!imageResult.file) {
                throw new Error(imageResult.error || "PDF Conversion Failed");
            }
            const resumeText = await extractTextFromPdf(file);

            let targetResumeId = crypto.randomUUID();
            const timestamp = Date.now();
            const resumePath = `${session.user.id}/${timestamp}_${file.name}`;
            const imagePath = `${session.user.id}/${timestamp}_${imageResult.file.name}`;

            const { error: resumeError } = await supabase.storage.from('resumes').upload(resumePath, file);
            if (resumeError) throw new Error(`Resume Upload Failed: ${resumeError.message}`);

            const { error: imageError } = await supabase.storage.from('resumes').upload(imagePath, imageResult.file);
            if (imageError) throw new Error(`Image Upload Failed: ${imageError.message}`);

            const { data: dbData, error: dbError } = await supabase
                .from('resumes')
                .insert({
                    user_id: session.user.id,
                    company_name: companyName,
                    job_title: jobTitle,
                    job_description: jobDescription,
                    resume_path: resumePath,
                    image_path: imagePath,
                    feedback: null,
                    status: 'pending',
                    overall_score: null,
                })
                .select()
                .single();

            if (dbError) throw new Error(`DB Save Failed: ${dbError.message}`);
            targetResumeId = dbData.id;

            try {
                await submitAndPoll({
                    companyName,
                    jobTitle,
                    jobDescription,
                    resumeText,
                    resumeId: targetResumeId
                }, session.access_token);
            } catch (streamErr: any) {
                throw new Error(streamErr.message || "Connection lost during analysis. Your resume was not saved — please try again.");
            }

        } catch (error: any) {
            console.error("Upload Logic Error:", error);
            setUploadError(error.message || "An error occurred during analysis.");
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return (
            <main className="min-h-screen bg-[#0A0A0F] text-[#F8F9FC] font-sans pb-24">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 pt-20">
                    <div className="text-center animate-fade-in-up">
                        <p className="text-[#A1A1AA] text-sm mb-2 uppercase tracking-widest font-medium">Analyzing for</p>
                        <p className="text-2xl font-bold text-[#F8F9FC]">{jobTitle} at <span className="text-[#10B981]">{companyName}</span></p>
                    </div>

                    <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="h-1.5 bg-[#13131A] rounded-full overflow-hidden border border-[#27272A]">
                            <motion.div
                                className="h-full bg-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                animate={{ width: `${stages[loadingStage].progress}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    <motion.div
                        key={loadingStage}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <p className="text-xl font-medium text-[#F8F9FC]">{stages[loadingStage].label}</p>
                        <p className="text-[#A1A1AA] mt-2">{stages[loadingStage].sublabel}</p>
                    </motion.div>

                    {streamBuffer && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-md bg-[#13131A] border border-[#27272A] rounded-xl p-5 font-mono text-xs text-[#A1A1AA] overflow-hidden max-h-32 relative shadow-inner break-words whitespace-pre-wrap text-left"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#13131A] to-transparent pointer-events-none" />
                            {streamBuffer.slice(-400)}
                            <span className="animate-pulse text-[#6366F1] ml-1">▌</span>
                        </motion.div>
                    )}
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0A0A0F] text-[#F8F9FC] font-sans pb-24">
            <Navbar />

            <div className="container mx-auto px-4 pt-28">
                <div className="max-w-[680px] mx-auto">

                    {/* Header & Progress */}
                    <div className="mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between text-sm font-medium text-[#6B7280] mb-6"
                        >
                            <span className={companyName ? "text-[#10B981]" : "text-[#F8F9FC]"}>Company</span>
                            <span className="text-[#27272A]">&rarr;</span>
                            <span className={jobTitle ? "text-[#10B981]" : companyName ? "text-[#F8F9FC]" : ""}>Role</span>
                            <span className="text-[#27272A]">&rarr;</span>
                            <span className={file ? "text-[#10B981]" : jobTitle ? "text-[#F8F9FC]" : ""}>Resume</span>
                            <span className="text-[#27272A]">&rarr;</span>
                            <span className={jobDescription ? "text-[#10B981]" : file ? "text-[#F8F9FC]" : ""}>JD</span>
                        </motion.div>
                        <div className="h-1 w-full bg-[#13131A] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#6366F1]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(filledFields / 4) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Company & Role */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid sm:grid-cols-2 gap-6"
                        >
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#A1A1AA]">Target Company</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building className="h-5 w-5 text-[#6B7280]" />
                                    </div>
                                    <motion.input
                                        animate={shakeFields && !companyName ? { x: [-10, 10, -10, 10, 0] } : {}}
                                        transition={{ duration: 0.4 }}
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Google"
                                        className="w-full pl-10 pr-4 py-3 bg-[#13131A] border border-[#27272A] rounded-xl text-[#F8F9FC] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#A1A1AA]">Role</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Briefcase className="h-5 w-5 text-[#6B7280]" />
                                    </div>
                                    <motion.input
                                        animate={shakeFields && !jobTitle ? { x: [-10, 10, -10, 10, 0] } : {}}
                                        transition={{ duration: 0.4 }}
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g. Frontend Engineer"
                                        className="w-full pl-10 pr-4 py-3 bg-[#13131A] border border-[#27272A] rounded-xl text-[#F8F9FC] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Resume Dropzone */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                        >
                            <label className="block text-sm font-medium text-[#A1A1AA]">Resume (PDF)</label>
                            <motion.div
                                animate={shakeFields && !file ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`relative overflow-hidden border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-8 bg-[#13131A] ${isDragging ? 'border-[#6366F1] bg-[#6366F1]/5' :
                                        file ? 'border-[#10B981] bg-[#10B981]/5' :
                                            'border-[#27272A] hover:border-[#3F3F46]'
                                    }`}
                            >
                                {file ? (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                                            </div>
                                            <div>
                                                <p className="text-[#F8F9FC] font-medium">{file.name}</p>
                                                <p className="text-sm text-[#A1A1AA]">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); setFile(null); }}
                                            className="p-2 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 mb-4 rounded-full bg-[#27272A] flex items-center justify-center text-[#A1A1AA]">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="text-[#F8F9FC] font-medium mb-1">Drag your PDF here</p>
                                        <p className="text-sm text-[#6B7280] mb-4">or click to browse</p>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f && f.type === 'application/pdf') {
                                                    setFile(f);
                                                    toast.success("Resume attached!");
                                                } else if (f) {
                                                    toast.error("Please upload a PDF file.");
                                                }
                                            }}
                                            className="hidden"
                                            id="file-input"
                                        />
                                        <label htmlFor="file-input">
                                            <span className="px-5 py-2 border border-[#3F3F46] hover:bg-[#27272A] text-[#F8F9FC] font-medium rounded-lg cursor-pointer transition-colors inline-block pointer-events-auto">
                                                Select File
                                            </span>
                                        </label>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>

                        {/* Job Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-2"
                        >
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-medium text-[#A1A1AA]">Job Description</label>
                                <span className="text-xs text-[#6B7280] font-mono">{jobDescription.length} chars</span>
                            </div>
                            <div className="relative">
                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                    <FileSearch className="h-5 w-5 text-[#6B7280]" />
                                </div>
                                <motion.textarea
                                    animate={shakeFields && !jobDescription ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    rows={8}
                                    placeholder="Paste the full job description here..."
                                    className="w-full pl-10 pr-4 py-3 bg-[#13131A] border border-[#27272A] rounded-xl text-[#F8F9FC] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all resize-none shadow-sm min-h-[200px]"
                                />
                            </div>
                        </motion.div>

                        {/* Error Banner */}
                        {uploadError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl flex gap-3 items-start"
                            >
                                <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                                <div className="text-[#F8F9FC] text-sm leading-relaxed">
                                    {uploadError}
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className={`relative w-full h-14 rounded-xl font-medium text-lg transition-all overflow-hidden ${
                                        isFormValid ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                                            'bg-[#1E1E24] text-[#6B7280] cursor-not-allowed border border-[#27272A]'
                                    }`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Analyze {companyName ? `for ${companyName}` : 'Resume'}
                                </div>
                            </button>
                        </motion.div>

                    </form>
                </div>
            </div>
        </main>
    );
};

export default UploadPage;
