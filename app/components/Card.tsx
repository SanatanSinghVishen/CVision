import React from 'react';

type ReactNode = React.ReactNode;

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
}

const Card = ({ children, className = '', hover = true, gradient = false }: CardProps) => {
    const baseStyles = 'bg-[#13131A] backdrop-blur-md border border-[#27272A] rounded-2xl p-6 animate-fade-in-up';
    const hoverStyles = hover ? 'transition-all duration-300 hover:bg-[#1E1E24] hover:border-[#3F3F46] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1' : '';
    const gradientStyles = gradient ? 'relative before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-[#6366F1] before:to-[#A855F7] before:-z-10' : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}>
            {children}
        </div>
    );
};

export default Card;

