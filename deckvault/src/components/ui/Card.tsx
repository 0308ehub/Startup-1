import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
	return <div className={clsx("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
	return <div className={clsx("p-4 border-b border-slate-100", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
	return <h3 className={clsx("text-sm font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
	return <div className={clsx("p-4", className)}>{children}</div>;
}


