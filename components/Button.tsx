import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5';

    const variantStyles = {
      primary:
        'bg-gradient-to-br from-[#C99A4D] via-[#A67C38] to-[#8B6B29] text-white hover:from-[#D4A857] hover:via-[#B18A3D] hover:to-[#9A7330] active:from-[#A67C38] active:to-[#7A5F25] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-black/20 before:transition-opacity after:absolute after:inset-0 after:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-700',
      secondary:
        'bg-gradient-to-br from-gray-400 via-gray-600 to-gray-800 text-white hover:from-gray-500 hover:via-gray-700 hover:to-gray-900 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-black/20 after:absolute after:inset-0 after:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-700',
      outline:
        'border-2 border-[#A67C38] text-[#A67C38] bg-gradient-to-br from-white via-[#FBF7F0] to-white backdrop-blur-sm hover:from-[#FBF7F0] hover:via-[#F5EFE0] hover:to-[#FBF7F0] active:bg-[#F5EFE0] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-md',
      md: 'px-6 py-3 text-base rounded-lg',
      lg: 'px-8 py-4 text-lg rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
