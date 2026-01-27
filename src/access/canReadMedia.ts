import { checkRole } from '@/access/utilities'
import type { Access, Where } from 'payload'

export const canReadMedia: Access = ({ req }) => {
  // Admin has unrestricted access to all media (public + private)
  if (req.user && checkRole(['admin'], req.user)) {
    return true
  }

  // Authenticated non-admin users:
  // - Can see all public files
  // - Can only see private files they uploaded themselves
  if (req.user?.id) {
    const onCondition: Where = {
      or: [
        {
          type: {
            equals: 'public',
          },
        },
        {
          and: [
            {
              type: {
                equals: 'private',
              },
            },
            {
              uploadedBy: {
                equals: req.user.id,
              },
            },
          ],
        },
      ],
    }

    return onCondition
  }

  // Unauthenticated users (guests):
  // - Can only see public files
  // - Private files are completely hidden
  return {
    type: {
      equals: 'public',
    },
  }
}
