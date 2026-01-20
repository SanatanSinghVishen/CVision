import React from 'react';

type ReactNode = React.ReactNode;

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
}

const Card = ({ children, className = '', hover = true, gradient = false }: CardProps) => {
    const baseStyles = 'bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 animate-fade-in-up';
    const hoverStyles = hover ? 'transition-all duration-300 hover:bg-slate-900/70 hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1' : '';
    const gradientStyles = gradient ? 'relative before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-violet-500 before:to-fuchsia-500 before:-z-10' : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
