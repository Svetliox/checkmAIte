'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-transform shadow-sm touch-manipulation ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ' +
      'active:scale-95';

    const variants = {
      primary:
        'bg-gradient-to-b from-accent-primary to-accent-primary/90 text-white shadow-md ' +
        'hover:shadow-lg hover:from-accent-primary/95 hover:to-accent-primary/85 ' +
        'active:shadow-sm focus-visible:ring-accent-primary',
      secondary:
        'bg-gradient-to-b from-accent-secondary to-accent-secondary/90 text-white shadow-md ' +
        'hover:shadow-lg hover:from-accent-secondary/95 hover:to-accent-secondary/85 ' +
        'active:shadow-sm focus-visible:ring-accent-secondary',
      outline:
        'border-2 border-border-default bg-surface-1 text-foreground shadow ' +
        'hover:border-accent-primary hover:bg-accent-primary/5 hover:shadow-md ' +
        'active:shadow-sm focus-visible:ring-accent-primary',
      ghost:
        'text-foreground/80 hover:text-foreground hover:bg-surface-2/80 ' +
        'active:bg-surface-3 focus-visible:ring-accent-primary',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-5 py-2.5 text-base min-h-[44px]',
      lg: 'px-7 py-3.5 text-lg min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
