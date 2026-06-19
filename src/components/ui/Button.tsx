import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:  "bg-[#009640] text-white hover:bg-[#007A33] disabled:opacity-50",
  secondary:"border border-[#009640] bg-white text-[#009640] hover:bg-[#EAF6EE] disabled:opacity-50",
  ghost:    "bg-transparent text-[#4B5563] hover:bg-[#F5F5F5] disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#009640] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
