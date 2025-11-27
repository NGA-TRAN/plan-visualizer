// Zod Validation Schemas for Form Demo
// Reusable validation schemas for common form patterns

import { z } from 'zod'

// User profile form schema
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  birthDate: z
    .string()
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      const now = new Date()
      return date < now
    }, 'Birth date must be in the past')
    .optional(),
  role: z.enum(['user', 'admin', 'moderator'], {
    message: 'Please select a role',
  }),
  department: z
    .string()
    .min(1, 'Please select a department'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

// Contact form schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
})

export type ContactFormData = z.infer<typeof contactSchema>

// Settings form schema
export const settingsSchema = z.object({
  language: z.string().min(1, 'Please select a language'),
  timezone: z.string().min(1, 'Please select a timezone'),
  theme: z.enum(['light', 'dark', 'system']),
  emailDigest: z.enum(['daily', 'weekly', 'monthly', 'never']),
  twoFactor: z.boolean(),
  marketingEmails: z.boolean(),
})

export type SettingsFormData = z.infer<typeof settingsSchema>

