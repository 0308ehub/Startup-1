import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React from "react";

const buttonStyles = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
	{
		variants: {
			variant: {
				primary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-400",
				secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-300",
				ghost: "text-slate-700 hover:bg-slate-100",
			},
			size: {
				sm: "h-9 px-3",
				md: "h-10 px-4",
				lg: "h-11 px-5 text-base",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	}
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
	return <button className={clsx(buttonStyles({ variant, size }), className)} {...props} />;
}


