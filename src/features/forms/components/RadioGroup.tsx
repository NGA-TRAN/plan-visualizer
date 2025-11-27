// RadioGroup Component
// Radio button group with React Hook Form integration

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  options: RadioOption[]
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ label, error, helperText, options, orientation = 'vertical', className, name, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </div>
        )}
        <div
          className={cn(
            'flex gap-4',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
            className
          )}
          role="radiogroup"
          aria-labelledby={label ? `${name}-label` : undefined}
        >
          {options.map((option, index) => (
            <div key={option.value} className="flex items-center gap-2">
              <div className="relative flex items-center">
                <input
                  ref={index === 0 ? ref : undefined}
                  id={`${name}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'peer w-5 h-5 border-2 rounded-full appearance-none cursor-pointer',
                    'bg-white dark:bg-gray-800',
                    'checked:border-primary-600 dark:checked:border-primary-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    error
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  aria-invalid={error ? 'true' : 'false'}
                  {...props}
                />
                <div className="absolute w-2.5 h-2.5 bg-primary-600 dark:bg-primary-500 rounded-full pointer-events-none opacity-0 peer-checked:opacity-100 left-[5px]" />
              </div>
              <label
                htmlFor={`${name}-${option.value}`}
                className={cn(
                  'text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        {error && (
          <p id={`${name}-error`} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${name}-helper`} className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

