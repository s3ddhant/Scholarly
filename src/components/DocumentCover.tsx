import React from 'react';

interface DocumentCoverProps {
  title: string;
  author: string;
  source?: string;
  coverColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DocumentCover: React.FC<DocumentCoverProps> = ({
  title,
  author,
  source,
  coverColor = '#9E4736',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-20 h-28 p-2.5 text-xs',
    md: 'w-28 h-40 p-3.5 text-sm',
    lg: 'w-36 h-52 p-4 text-base',
  }[size];

  return (
    <div
      id={`cover-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      style={{ backgroundColor: coverColor }}
      className={`relative rounded-2xl flex flex-col justify-between text-white shadow-md overflow-hidden shrink-0 select-none transition-transform hover:scale-[1.02] ${sizeClasses} ${className}`}
    >
      {/* Book spine aesthetic highlight line on left */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20 backdrop-blur-[1px] border-r border-white/10" />

      {/* Subtle decorative geometric reading accent */}
      <div className="absolute right-2 top-2 opacity-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* Header / Source stamp */}
      <div className="pl-2 pt-0.5">
        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75 line-clamp-1">
          {source?.split('/')[0] || 'Scholarly Paper'}
        </span>
      </div>

      {/* Main Title & Author */}
      <div className="pl-2 z-10">
        <h4 className="font-serif-title font-bold leading-tight line-clamp-3 text-white drop-shadow-sm mb-1 text-[13px]">
          {title}
        </h4>
        <p className="text-[10px] text-white/80 font-medium line-clamp-1">
          {author}
        </p>
      </div>

      {/* Bottom seal */}
      <div className="pl-2 flex items-center justify-between text-[8px] opacity-70">
        <span>EST. SCHOLARLY</span>
        <span>•</span>
      </div>
    </div>
  );
};
