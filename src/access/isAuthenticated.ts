import type { Access } from 'payload'

/**
 * Atomic access checker that verifies if the user Authenticated.
 *
 * @returns true if user is Authenticated, false otherwise
 */
export const isAuthenticated: Access = ({ req }) => {
  if (req.user) {
    return true
  }

  return false
}
