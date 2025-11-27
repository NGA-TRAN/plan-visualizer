// Users Page Component
// User management with table, modals, and CRUD operations

import { useState, useCallback } from 'react'
import { Plus, Download, AlertTriangle } from 'lucide-react'
import { Button, Card, CardContent, Modal, ModalFooter } from '@/shared/components'
import { UserTable } from './UserTable'
import { UserForm } from './UserForm'
import { useUserActions, useUsers } from '../hooks/useUserSelectors'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { exportUsersToCSV } from '../utils/exportCsv'
import type { User } from '@/types'

export function UsersPage() {
  const users = useUsers()
  const { addUser, updateUser, deleteUser } = useUserActions()
  const { notify } = useNotifications()

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Open create form
  const handleCreate = useCallback(() => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }, [])

  // Open edit form
  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }, [])

  // Open delete confirmation
  const handleDeleteClick = useCallback((user: User) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }, [])

  // Submit form (create or update)
  const handleFormSubmit = useCallback(
    async (data: { name: string; email: string; role: 'admin' | 'editor' | 'viewer'; status: 'active' | 'inactive' | 'pending'; avatar?: string }) => {
      setIsSubmitting(true)

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 300))

      try {
        const avatar = data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
        
        if (selectedUser) {
          updateUser(selectedUser.id, { ...data, avatar })
          notify.success(`User "${data.name}" updated successfully`)
        } else {
          addUser({ ...data, avatar })
          notify.success(`User "${data.name}" created successfully`)
        }

        setIsFormOpen(false)
        setSelectedUser(null)
      } catch {
        notify.error('An error occurred. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedUser, addUser, updateUser, notify]
  )

  // Confirm delete
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const userName = selectedUser.name
      deleteUser(selectedUser.id)
      notify.success(`User "${userName}" deleted successfully`)

      setIsDeleteOpen(false)
      setSelectedUser(null)
    } catch {
      notify.error('Failed to delete user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedUser, deleteUser, notify])

  // Export to CSV
  const handleExport = useCallback(() => {
    exportUsersToCSV(users)
    notify.success(`Exported ${users.length} users to CSV`)
  }, [users, notify])

  // Close modals
  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setSelectedUser(null)
  }, [])

  const closeDelete = useCallback(() => {
    setIsDeleteOpen(false)
    setSelectedUser(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Users
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleExport}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent>
          <UserTable onEdit={handleEdit} onDelete={handleDeleteClick} />
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedUser ? 'Edit User' : 'Create User'}
        description={
          selectedUser
            ? 'Update user information below.'
            : 'Fill in the details to create a new user.'
        }
      >
        <UserForm
          user={selectedUser ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        title="Delete User"
        size="sm"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-gray-900 dark:text-gray-100">
              Are you sure you want to delete{' '}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <ModalFooter className="-mx-6 -mb-4 mt-6">
          <Button variant="secondary" onClick={closeDelete}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            isLoading={isSubmitting}
          >
            Delete User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
