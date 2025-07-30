import React from 'react';
import goLogo from '../assets/go-logo.png';

interface LogoProps {
  color?: string;
}

const Gologo: React.FC<LogoProps> = ({ color = 'text-cyan-400' }) => {
  return (
    <div className="relative flex items-center">
      <img src={goLogo} alt="GO AI HUB" className="h-10 w-auto" />
    </div>
  );
};

export default Gologo;