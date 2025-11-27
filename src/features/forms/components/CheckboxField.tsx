// CheckboxField Component
// Checkbox input with React Hook Form integration

import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  helperText?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="space-y-1">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              className={cn(
                'peer w-5 h-5 border-2 rounded appearance-none cursor-pointer',
                'bg-white dark:bg-gray-800',
                'checked:bg-primary-600 checked:border-primary-600',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                error
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600',
                className
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
              {...props}
            />
            <Check className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-[3px]" />
          </div>
          <label
            htmlFor={inputId}
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600 dark:text-red-400 ml-8">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500 dark:text-gray-400 ml-8">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

CheckboxField.displayName = 'CheckboxField'

