import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-b-2 border-blue-500',
      sizeClasses[size],
      className
    )} />
  );
};

export { Spinner };
