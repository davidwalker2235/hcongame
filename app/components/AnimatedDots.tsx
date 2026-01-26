'use client';

import { useEffect, useState } from 'react';

type AnimatedDotsProps = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
};

export const AnimatedDots = ({ text, className, style }: AnimatedDotsProps) => {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        if (prev === '...') return '.';
        return '.';
      });
    }, 500); // Cambia cada 500ms

    return () => clearInterval(interval);
  }, []);

  // Reemplazar los puntos suspensivos en el texto con los puntos animados
  const displayText = text.replace(/\.\.\./g, dots);

  return (
    <span className={className} style={style}>
      {displayText}
    </span>
  );
};
