import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`overflow-hidden mb-1 mt-0 mx-auto inline-block ${className}`}>
      <Image 
        src="/harx-blanc.jpg" 
        alt="HARX Logo" 
        width={320}
        height={112}
        className="md:w-80 md:h-[7rem] object-contain rounded-2xl"
        style={{ borderRadius: '15%' }}
        priority
      />
    </div>
  );
};

export default Logo;



