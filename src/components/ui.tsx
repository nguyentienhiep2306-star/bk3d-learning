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
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition',
        variant === 'primary' && 'bg-[#0f6f64] text-white hover:bg-[#0b5c53]',
        variant === 'secondary' && 'border border-[#c7d3de] bg-white text-[#172033] hover:bg-[#edf4f8]',
        variant === 'ghost' && 'text-[#365066] hover:bg-[#e8f0f4]',
        variant === 'danger' && 'bg-[#b43232] text-white hover:bg-[#922626]',
        className,
      )}
      {...props}
    />
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('min-h-11 w-full rounded-md border border-[#c7d3de] bg-white px-3 text-sm outline-none focus:border-[#0f6f64] focus:ring-2 focus:ring-[#9fd5cc]', props.className)} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('min-h-28 w-full rounded-md border border-[#c7d3de] bg-white px-3 py-2 text-sm outline-none focus:border-[#0f6f64] focus:ring-2 focus:ring-[#9fd5cc]', props.className)} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('min-h-11 w-full rounded-md border border-[#c7d3de] bg-white px-3 text-sm outline-none focus:border-[#0f6f64] focus:ring-2 focus:ring-[#9fd5cc]', props.className)} />
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border border-[#d9e2ea] bg-white p-5 shadow-sm', className)}>{children}</div>
}

export function Alert({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' | 'success' }) {
  return (
    <div
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        tone === 'info' && 'border-[#b9d9e9] bg-[#edf8fc] text-[#24475a]',
        tone === 'error' && 'border-[#efb8b8] bg-[#fff1f1] text-[#8f2424]',
        tone === 'success' && 'border-[#a8d8bd] bg-[#eefaf3] text-[#1f6a3d]',
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
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#0f6f64]">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">{title}</h1>
      </div>
      {actions}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#dbe6ed]">
      <div className="h-full rounded-full bg-[#0f6f64]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
