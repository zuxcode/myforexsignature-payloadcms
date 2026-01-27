import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdminOrSelf'
import { getPasswordResetEmailHTML, getVerificationEmailHTML } from '@/lib/email-templates'
import { isPublicAccess } from '@/access/isPublicAccess'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'first_name', 'last_name', 'roles', 'createdAt'],
  },
  auth: {
    verify: {
      generateEmailHTML: async ({ user, token }) => {
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`
        const userFullname = user.first_name
          ? `${user.first_name} ${user.last_name || ''}`.trim()
          : user.email.split('@')[0]
        return getVerificationEmailHTML({ userFullname, verificationUrl })
      },

      generateEmailSubject: ({ user }) =>
        `Hey ${user.first_name || 'Trader'}, verify your MyForexSignature account`,
    },

    forgotPassword: {
      generateEmailSubject: (props) =>
        `Hey ${props?.user?.first_name || 'Trader'}, reset your MyForexSignature password`,

      generateEmailHTML: async (props) => {
        if (!props) {
          return ''
        }

        const { token, user } = props
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`
        const userFullname = user.first_name
          ? `${user.first_name} ${user.last_name || ''}`.trim()
          : user.email.split('@')[0]
        return getPasswordResetEmailHTML({ userFullname, resetUrl: verificationUrl })
      },
    },

    maxLoginAttempts: 5,
    lockTime: 600 * 1000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  access: {
    create: isPublicAccess,
    // Admins can read all, but any other logged in user can only read themselves
    read: isPublicAccess,
    // read: isAdminOrSelf,
    // Admins can update all, but any other logged in user can only update themselves
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
  },

  fields: [
    {
      name: 'first_name',
      type: 'text',
      label: 'First name',
      required: true,
    },
    {
      name: 'last_name',
      type: 'text',
      label: 'Last name',
      required: false,
    },
    {
      name: 'roles',
      // Save this field to JWT so we can use from `req.user`
      saveToJWT: true,
      type: 'select',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
      defaultValue: ['customer'],
      access: {
        // Only admins can create or update a value for this field
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Staff',
          value: 'staff',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Customer',
          value: 'customer',
        },
      ],
    },

    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],

  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        // Only send welcome email for new users
        if (operation === 'create') {
          await req.payload.jobs.queue({
            task: 'sendWelcomeEmail',
            input: {
              userEmail: doc.email,
              userFullname: `${doc.first_name} ${doc.last_name}`,
            },
          })
          const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          await req.payload.jobs.queue({
            task: 'sendPromotionalWelcomeEmail',
            input: {
              userEmail: doc.email,
              userFullname: `${doc.first_name} ${doc.last_name}`,
            },
            waitUntil: twoDaysFromNow,
          })
        }
      },
    ],
  },
}
