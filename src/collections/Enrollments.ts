import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    group: 'course',
    useAsTitle: 'userEmail', // Custom title – shows user email + course
    defaultColumns: ['user', 'course', 'enrolledAt', 'progress', 'status'],
    description: 'Tracks user enrollments in courses – free or paid.',
  },

  access: {
    // Users can read their own enrollments
    read: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return { user: { equals: user?.id } }
    },
    // Only admins can create/update (frontend handles via API/hook)
    create: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    update: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    delete: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
  },

  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true, // For fast queries
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
      name: 'userEmail', // Denormalized for easy admin display/search
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-populated from user for quick search.',
      },
    },
    {
      name: 'courseTitle', // Denormalized
      type: 'text',
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'enrolledAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },

    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'enrolled',
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: '% complete – updated by frontend or lesson completion hooks.',
      },
    },

    // Optional: Track completed lessons for granular progress
    {
      name: 'completedLessons',
      type: 'array',
      fields: [
        {
          name: 'lessonId',
          type: 'text', // Or relationship if lessons have IDs
        },
        {
          name: 'completedAt',
          type: 'date',
        },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          // Denormalize for easy admin search/display
          const user = await req.payload.findByID({
            collection: 'users',
            id: data.user,
            depth: 0,
          })
          const course = await req.payload.findByID({
            collection: 'courses',
            id: data.course,
            depth: 0,
          })

          return {
            ...data,
            userEmail: user.email,
            courseTitle: course.title,
          }
        }
        return data
      },
    ],

    // Prevent duplicate enrollments
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const existing = await req.payload.find({
            collection: 'enrollments',
            where: {
              and: [{ user: { equals: data?.user } }, { course: { equals: data?.course } }],
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            throw new Error('User is already enrolled in this course')
          }
        }
        return data
      },
    ],
  },
}
