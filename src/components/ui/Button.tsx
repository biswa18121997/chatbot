import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          // Variants
          'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800': variant === 'primary',
          'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300': variant === 'secondary',
          'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100': variant === 'outline',
          'text-slate-700 hover:bg-slate-100 active:bg-slate-200': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800': variant === 'danger',
          // Sizes
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
          // Width
          'w-full': fullWidth,
        },
        'rounded-lg',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}