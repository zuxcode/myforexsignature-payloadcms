import { isPublicAccess } from '@/access/isPublicAccess'
import type { CollectionConfig } from 'payload'

export const CoursePurchases: CollectionConfig = {
  slug: 'course-purchases',
  admin: {
    group: 'course',
    useAsTitle: 'orderId',
    defaultColumns: ['orderId', 'user', 'course', 'amount', 'status', 'createdAt'],
    description: 'Tracks paid course purchases – integrates with AstroPay for payments.',
  },

  access: {
    // Users can read their own purchases
    read: isPublicAccess,
    // Only server/admin can create (payment webhook or server action)
    create: isPublicAccess,
    update: isPublicAccess,
    delete: isPublicAccess,
    // read: ({ req: { user } }) => {
    //   if (user?.roles?.includes('admin')) return true
    //   return { user: { equals: user?.id } }
    // },
    // // Only server/admin can create (payment webhook or server action)
    // create: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    // update: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    // delete: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
  },

  fields: [
    {
      name: 'orderId',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'Unique order reference – generated on creation.',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Amount in USD cents (e.g., 9999 = $99.99)',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'transactionId',
      type: 'text',
      label: 'AstroPay Transaction ID',
      admin: {
        description: 'Filled by webhook on successful payment.',
      },
    },
    {
      name: 'paymentMethod',
      type: 'text',
      admin: {
        description: 'e.g., card, bank_transfer – from AstroPay response.',
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],

  hooks: {
    // On successful payment (status → paid) → auto-create enrollment
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'update' && doc.status === 'paid' && doc.paidAt) {
          // Create enrollment if not exists
          const existing = await req.payload.find({
            collection: 'enrollments',
            where: {
              and: [{ user: { equals: doc.user } }, { course: { equals: doc.course } }],
            },
            limit: 1,
          })

          if (existing.docs.length === 0) {
            await req.payload.create({
              collection: 'enrollments',
              data: {
                user: doc.user,
                course: doc.course,
                status: 'enrolled',
                enrolledAt: new Date().toISOString(),
              },
            })
          }
        }
      },
    ],
  },
}
