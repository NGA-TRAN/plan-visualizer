// Form Demo Page
// Showcases all form components with validation

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/shared/components'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { TextField } from './TextField'
import { SelectField } from './SelectField'
import { CheckboxField } from './CheckboxField'
import { RadioGroup } from './RadioGroup'
import { DatePicker } from './DatePicker'
import { contactSchema, type ContactFormData } from '../schemas'

// Demo options
const priorityOptions = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' },
]

const categoryOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'feedback', label: 'Feedback' },
]

const contactMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'chat', label: 'Live Chat' },
]

export function FormDemo() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { notify } = useNotifications()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      priority: 'medium',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    console.log('Form submitted:', data)
    notify.success('Form submitted successfully!')
    reset()
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Form Components
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Showcase of reusable form components with validation
        </p>
      </div>

      {/* Contact Form Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Text Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                required
                {...register('name')}
              />
              <TextField
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />
            </div>

            {/* Subject */}
            <TextField
              label="Subject"
              placeholder="How can we help?"
              error={errors.subject?.message}
              required
              {...register('subject')}
            />

            {/* Select and Radio Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Priority"
                options={priorityOptions}
                error={errors.priority?.message}
                {...register('priority')}
              />
              <RadioGroup
                label="Preferred Contact Method"
                name="contactMethod"
                options={contactMethodOptions}
                orientation="horizontal"
              />
            </div>

            {/* Message Textarea (using TextField with custom styling) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe your inquiry..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                {...register('message')}
              />
              {errors.message && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Checkbox */}
            <CheckboxField
              label="I agree to be contacted regarding this inquiry"
              {...register('termsAccepted' as keyof ContactFormData)}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Components Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Picker */}
          <DatePicker
            label="Select a Date"
            helperText="Choose your preferred date"
          />

          {/* Select with Categories */}
          <SelectField
            label="Category"
            options={categoryOptions}
            placeholder="Select a category..."
            helperText="This helps us route your request"
          />

          {/* Radio Group Vertical */}
          <RadioGroup
            label="Notification Preferences"
            name="notificationPref"
            options={[
              { value: 'all', label: 'All notifications' },
              { value: 'important', label: 'Important only' },
              { value: 'none', label: 'No notifications' },
            ]}
            orientation="vertical"
            helperText="Choose how often you want to be notified"
          />

          {/* Multiple Checkboxes */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Features to Enable
            </div>
            <div className="space-y-2">
              <CheckboxField label="Enable email notifications" />
              <CheckboxField label="Enable SMS alerts" />
              <CheckboxField label="Enable push notifications" />
            </div>
          </div>

          {/* Disabled States */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Disabled States
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Disabled Text Field"
                value="Cannot be edited"
                disabled
              />
              <SelectField
                label="Disabled Select"
                options={[{ value: 'disabled', label: 'Disabled option' }]}
                disabled
              />
            </div>
          </div>

          {/* Error States */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Error States
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Invalid Email"
                value="not-an-email"
                error="Please enter a valid email address"
              />
              <SelectField
                label="Required Field"
                options={categoryOptions}
                placeholder="Select..."
                error="This field is required"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
