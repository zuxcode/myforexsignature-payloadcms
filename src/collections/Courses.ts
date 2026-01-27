import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { slugify } from 'payload/shared'
import { isPublicAccess } from '@/access/isPublicAccess'

export const CoursesCollection: CollectionConfig = {
  slug: 'courses',
  admin: {
    group: 'course',
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'isPublished', 'enrollments', 'updatedAt'],
    preview: (doc) => `${process.env.NEXT_PUBLIC_APP_URL}/courses/${doc.slug}`,
  },

  access: {
    read: isPublicAccess,
    create: isPublicAccess,
    update: isPublicAccess,
    delete: isPublicAccess,
    // read: () => true,
    // create: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    // update: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
    // delete: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from title – edit carefully for SEO URLs.',
      },
    },

    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
    },

    // Pricing row
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'isFree',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },

    // Thumbnail
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: () => ({ mimeType: { contains: 'image' } }),
    },

    // === Sequential Access Control ===
    {
      name: 'requireSequentialCompletion',
      type: 'checkbox',
      defaultValue: true,
      label: 'Require Sequential Completion',
      admin: {
        position: 'sidebar',
        description:
          'If enabled, users must complete all lessons in a section before accessing the next. Progress tracked per enrollment.',
      },
    },

    // Course Content – sections with unique IDs for progress tracking
    {
      name: 'sections',
      type: 'array',
      label: 'Course Sections',
      required: true,
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            readOnly: true,
            description: 'Auto-generated unique ID for progress tracking.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'lessons',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'id',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                readOnly: true,
                description: 'Auto-generated unique ID for completion tracking.',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'video',
              type: 'upload',
              relationTo: 'media',
              filterOptions: () => ({ mimeType: { contains: 'video' } }),
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor(),
            },
            {
              name: 'duration',
              type: 'text',
            },
          ],
        },
      ],
    },

    // Meta fields
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: { position: 'sidebar' },
    },
    // Audit
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!req.user) throw new Error('Authentication required')

        if (data.title && !data.slug) {
          data.slug = slugify(data.title)
        }

        if (operation === 'create') {
          data.createdBy = req.user.id
        }
        data.updatedBy = req.user.id

        if (operation === 'create' || operation === 'update') {
          // Auto-generate unique IDs for sections & lessons if missing
          if (data.sections) {
            data.sections = data.sections.map((section: any) => ({
              ...section,
              id: section.id || crypto.randomUUID(),
              lessons: section.lessons?.map((lesson: any) => ({
                ...lesson,
                id: lesson.id || crypto.randomUUID(),
              })),
            }))
          }

          // Auto-set publishedAt
          if (data.isPublished && !data.publishedAt) {
            data.publishedAt = new Date().toISOString()
          }
        }
        return data
      },
    ],
  },
}
