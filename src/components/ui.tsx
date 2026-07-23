import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        variant === 'primary' && 'bg-brand text-white hover:bg-brand-hover',
        variant === 'secondary' && 'border border-border bg-white text-[#111827] hover:bg-technical-soft',
        variant === 'ghost' && 'text-[#475569] hover:bg-technical-soft',
        variant === 'danger' && 'bg-brand text-white hover:bg-brand-hover',
        className,
      )}
      {...props}
    />
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft', props.className)} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('min-h-28 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft', props.className)} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft', props.className)} />
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-xl border border-border bg-surface p-6 shadow-sm', className)}>{children}</div>
}

export function Alert({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' | 'success' }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        tone === 'info' && 'border-brand-border bg-brand-soft text-brand',
        tone === 'error' && 'border-brand-border bg-brand-soft text-brand',
        tone === 'success' && 'border-brand-border bg-brand-soft text-brand',
      )}
    >
      {children}
    </div>
  )
}

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">{title}</h1>
      </div>
      {actions}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#dbe6ed]">
      <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}


