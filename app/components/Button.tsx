import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

type ReactNode = React.ReactNode;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    isLoading?: boolean;
}

const Button = ({
    variant = 'primary',
    size = 'md',
    children,
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40',
        secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-white/10 hover:border-white/20',
        ghost: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
        glass: 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/10 hover:border-white/30'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-full'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : children}
        </button>
    );
};

export default Button;
