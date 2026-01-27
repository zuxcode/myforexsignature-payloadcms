import { slugField, type CollectionConfig } from 'payload'
import { slugify } from 'payload/shared'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'title',
    group: 'course',
    defaultColumns: ['title', 'slug', 'courseCount', 'updatedAt'],
    description:
      'Tags for categorizing courses (e.g., Beginner, Risk Management, Technical Analysis).',
  },

  access: {
    read: () => true,
    //   create: ({ req: { user } }) => user?.roles?.includes("admin") ?? false,
    //   update: ({ req: { user } }) => user?.roles?.includes("admin") ?? false,
    //   delete: ({ req: { user } }) => user?.roles?.includes("admin") ?? false,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      unique: true,
      label: 'Tag Title',
      admin: {
        description: "Display name – e.g., 'Beginner', 'Advanced', 'Scalping'",
      },
    },

    slugField(),
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Red', value: 'red' },
        { label: 'Gray', value: 'gray' },
      ],
      defaultValue: 'gray',
      admin: {
        description: 'Badge color in course cards – matches shadcn theme.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description (optional)',
      admin: {
        description: 'Short description shown on hover or tag page.',
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' || (operation === 'update' && data.title)) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
}
