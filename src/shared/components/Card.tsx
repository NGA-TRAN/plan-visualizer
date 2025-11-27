// Shared Card Component
// Container with optional header and footer

import { type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

