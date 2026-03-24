import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  labelAction?: React.ReactNode
}

export function PasswordInput({
  label,
  error,
  labelAction,
  id,
  className = '',
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      {(label || labelAction) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="text-[14px] font-medium text-[var(--text-primary)]"
            >
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`h-11 w-full rounded-[10px] border bg-transparent px-3.5 pr-11 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none ${
            error
              ? 'border-[var(--status-expired)] focus:border-[var(--status-expired)]'
              : 'border-[var(--border-standard)] focus:border-[var(--accent-purple)]'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-[13px] text-[var(--status-expired)]">{error}</p>
      )}
    </div>
  )
}
