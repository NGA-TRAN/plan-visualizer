// User Selectors Hook
// Convenience selectors for user slice from centralized store

import { useAppStore } from '@/store'

// Selector hooks
export const useUsers = () => useAppStore((state) => state.users)
export const useAddUser = () => useAppStore((state) => state.addUser)
export const useUpdateUser = () => useAppStore((state) => state.updateUser)
export const useDeleteUser = () => useAppStore((state) => state.deleteUser)

// Combined hook for all user actions
export function useUserActions() {
  const addUser = useAppStore((state) => state.addUser)
  const updateUser = useAppStore((state) => state.updateUser)
  const deleteUser = useAppStore((state) => state.deleteUser)

  return { addUser, updateUser, deleteUser }
}

