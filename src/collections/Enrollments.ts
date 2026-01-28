import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    group: 'course',
    useAsTitle: 'userEmail',
    defaultColumns: ['user', 'course', 'enrolledAt', 'progress', 'watchHours', 'status'],
    description: 'Tracks user enrollments in courses – free or paid, with watch time analytics.',
  },

  access: {
    read: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return { user: { equals: user?.id } }
    },
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
      index: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      index: true,
    },
    {
      name: 'userEmail',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'courseTitle',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'enrolledAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar' },
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
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
    },
    {
      name: 'watchHours',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Total hours watched (decimal). Auto-calculated from lesson watch time.',
        position: 'sidebar',
      },
    },
    {
      name: 'lessonWatchTime',
      type: 'array',
      fields: [
        {
          name: 'lessonId',
          type: 'text',
          required: true,
        },
        {
          name: 'watchedSeconds',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'lastWatchedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'completedLessons',
      type: 'array',
      fields: [
        { name: 'lessonId', type: 'text' },
        { name: 'completedAt', type: 'date' },
      ],
    },
    {
      name: 'completedSections',
      type: 'array',
      fields: [
        { name: 'sectionId', type: 'text' },
        { name: 'completedAt', type: 'date' },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Denormalize userEmail & courseTitle on create
        if (operation === 'create') {
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

          data.userEmail = user.email
          data.courseTitle = course.title
          data.courseSlug = course.slug
        }

        // Auto-calculate watchHours from lessonWatchTime on create/update
        if (data.lessonWatchTime?.length > 0) {
          const totalSeconds = data.lessonWatchTime.reduce(
            (acc: number, l: { watchedSeconds?: number }) => acc + (l.watchedSeconds || 0),
            0,
          )
          data.watchHours = Number((totalSeconds / 3600).toFixed(2))
        } else {
          data.watchHours = 0
        }

        return data
      },
    ],

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
