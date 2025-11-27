// User Form Component
// Create/Edit form with validation

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, ModalFooter } from '@/shared/components'
import type { User } from '@/types'

// Validation schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer'] as const),
  status: z.enum(['active', 'inactive', 'pending'] as const),
  avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type UserFormData = z.infer<typeof userSchema>

export interface UserFormProps {
  user?: User
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'viewer',
      status: user?.status ?? 'pending',
      avatar: user?.avatar ?? '',
    },
  })

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      })
    }
  }, [user, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="input"
          placeholder="Enter full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="input"
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="label">
          Role
        </label>
        <select id="role" {...register('role')} className="input">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="label">
          Status
        </label>
        <select id="status" {...register('status')} className="input">
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Avatar URL (optional) */}
      <div>
        <label htmlFor="avatar" className="label">
          Avatar URL (optional)
        </label>
        <input
          id="avatar"
          type="url"
          {...register('avatar')}
          className="input"
          placeholder="https://example.com/avatar.jpg"
        />
        {errors.avatar && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.avatar.message}
          </p>
        )}
      </div>

      {/* Footer */}
      <ModalFooter className="-mx-6 -mb-4 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isDirty && isEditing}
        >
          {isEditing ? 'Save Changes' : 'Create User'}
        </Button>
      </ModalFooter>
    </form>
  )
}

