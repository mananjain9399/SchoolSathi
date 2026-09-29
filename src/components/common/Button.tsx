import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'voice';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] select-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-sm py-2 px-3.5 gap-1.5 min-h-[42px]',
    md: 'text-base py-3 px-5 gap-2 min-h-[50px]',
    lg: 'text-lg py-4 px-6 gap-2.5 min-h-[58px]',
    xl: 'text-xl py-4.5 px-8 gap-3 min-h-[64px] rounded-3xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 border-b-4 border-orange-700 hover:border-orange-800',
    secondary:
      'bg-white hover:bg-orange-50 text-slate-800 border-2 border-orange-200 shadow-sm hover:border-orange-300',
    outline:
      'bg-transparent hover:bg-orange-100/50 text-orange-700 border-2 border-orange-300',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 border-b-4 border-emerald-800',
    voice:
      'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/35 border-b-4 border-orange-800 hover:scale-[1.02]',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};
