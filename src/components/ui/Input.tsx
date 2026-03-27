import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[14px] font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`h-11 w-full rounded-[10px] border bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none ${
          error
            ? 'border-[var(--status-expired)] focus:border-[var(--status-expired)]'
            : 'border-[var(--border-standard)] focus:border-[var(--accent-purple)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[13px] text-[var(--status-expired)]">{error}</p>
      )}
    </div>
  )
}
