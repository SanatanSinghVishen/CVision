import { type FormEvent, useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "~/components/Navbar";
import { type MetaFunction, useNavigate } from "react-router";
import { convertPdfToImage, extractTextFromPdf } from "~/lib/pdf2img";
import { supabase } from "~/lib/supabase";
import { Upload, FileText, Sparkles, CheckCircle2, Loader2, X, Building, Briefcase, FileSearch } from "lucide-react";
import { Card } from "~/components/ui/Card";
import toast from 'react-hot-toast';

export const meta: MetaFunction = () => {
    return [
        { title: "CVision | Analyze Resume" },
        { name: "description", content: "Upload your resume for AI analysis" },
    ];
};

const LOADING_MESSAGES = [
    "Reading your resume...",
    "Querying AI...",
    "Building your report...",
    "Finalizing insights..."
];

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
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
    const [shakeFields, setShakeFields] = useState(false);

    // Progressive indicator
    const filledFields = [companyName, jobTitle, file, jobDescription].filter(Boolean).length;
    const isFormValid = companyName && jobTitle && file && jobDescription;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
            interval = setInterval(() => {
                setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isFormValid) {
            triggerShake();
            toast.error("Please fill all required fields.");
            return;
        }

        setIsProcessing(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            // 2. Convert PDF & Extract Text
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
            let targetResumeId = crypto.randomUUID();

            if (session) {
                const timestamp = Date.now();
                const resumePath = `${session.user.id}/${timestamp}_${file.name}`;
                const imagePath = `${session.user.id}/${timestamp}_${imageResult.file.name}`;

                const { error: resumeError } = await supabase.storage.from('resumes').upload(resumePath, file);
                if (resumeError) throw new Error(`Resume Upload Failed: ${resumeError.message}`);

                const { error: imageError } = await supabase.storage.from('resumes').upload(imagePath, imageResult.file);
                if (imageError) throw new Error(`Image Upload Failed: ${imageError.message}`);

                // 4. Initial DB Insert
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
            }

            // 5. Call AI API
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName,
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
            navigate(`/resume/${targetResumeId}`, { state: { feedback, guestMode: !session } });

        } catch (error: any) {
            console.error("Upload Logic Error:", error);
            toast.error(error.message || "An error occurred during analysis.");
            setIsProcessing(false);
        }
    };

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
                                        {companyName ? (
                                            <img
                                                src={`https://logo.clearbit.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                                className="h-5 w-5 rounded-sm object-contain"
                                                alt=""
                                            />
                                        ) : null}
                                        <Building className={`h-5 w-5 text-[#6B7280] ${companyName ? 'hidden' : ''}`} />
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

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <button
                                type="submit"
                                disabled={(!isFormValid && !isProcessing) || isProcessing}
                                className={`relative w-full h-14 rounded-xl font-medium text-lg transition-all overflow-hidden ${isProcessing ? 'bg-[#1E1E24] cursor-not-allowed' :
                                        isFormValid ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                                            'bg-[#1E1E24] text-[#6B7280] cursor-not-allowed border border-[#27272A]'
                                    }`}
                            >
                                <AnimatePresence mode="wait">
                                    {isProcessing ? (
                                        <motion.div
                                            key="processing"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute inset-0 flex items-center justify-center gap-3 text-[#6366F1]"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{LOADING_MESSAGES[loadingMsgIdx]}</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute inset-0 flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            Analyze {companyName ? `for ${companyName}` : 'Resume'}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </motion.div>

                    </form>
                </div>
            </div>
        </main>
    );
};

export default UploadPage;
