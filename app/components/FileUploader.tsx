import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    })

    const file = acceptedFiles[0] || null;

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all duration-300
                    flex flex-col items-center justify-center text-center gap-4 min-h-[250px]
                    ${isDragActive
                        ? 'border-[#6366F1] bg-[#6366F1]/10 scale-[1.02]'
                        : 'border-[#27272A] hover:border-[#6366F1]/50 hover:bg-[#1E1E24]'
                    }
                    ${file ? 'bg-[#1E1E24] border-solid border-[#6366F1]/50' : ''}
                `}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="flex flex-col items-center gap-4 animate-fade-in-up w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
                            <span className="text-3xl">📄</span>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-[#F8F9FC] truncate max-w-sm">
                                {file.name}
                            </p>
                            <p className="text-sm text-[#A1A1AA]">
                                {formatSize(file.size)}
                            </p>
                        </div>
                        <button
                            className="bg-[#27272A] hover:bg-[#3F3F46] text-[#F8F9FC] rounded-full p-2 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileSelect?.(null);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={`
                            w-20 h-20 rounded-full bg-[#1E1E24] border border-[#27272A] flex items-center justify-center mb-2 transition-transform duration-300
                            ${isDragActive ? 'scale-110 bg-[#6366F1]/10 border-[#6366F1]/20' : ''}
                        `}>
                            <span className="text-4xl text-[#6366F1]">☁️</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-[#F8F9FC]">
                                {isDragActive ? 'Drop your resume here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-[#A1A1AA]">
                                PDF (max {formatSize(maxFileSize)})
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
export default FileUploader
