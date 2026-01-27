import { canReadMedia } from '@/access/canReadMedia'
import { isAdmin } from '@/access/isAdmin'
import { isAuthenticated } from '@/access/isAuthenticated'
import { isPublicAccess } from '@/access/isPublicAccess'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media File',
    plural: 'Media Library',
  },

  admin: {
    useAsTitle: 'filename',
    group: 'Content',
    defaultColumns: ['filename', 'type', 'alt', 'uploadedBy', 'updatedAt'],
    description:
      'Central media library. Public files are visible to everyone (e.g., product screenshots). Private files are restricted – only the uploader or admin can view them (e.g., payment receipts).',
  },
  access: {
    read: isPublicAccess,
    create: isPublicAccess,
    update: isPublicAccess,
    delete: isPublicAccess,
    // read: canReadMedia,
    // create: isAuthenticated,
    // update: isAdmin,
    // delete: isAdmin,
  },
  timestamps: true,

  upload: {
    mimeTypes: [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',

      // Videos – most common & browser-supported
      'video/mp4', // Universal (best for web)
      'video/webm', // Efficient, open format
      'video/ogg', // Fallback

      // Documents
      'application/pdf',
    ],

    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        crop: 'center',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 768,
        height: 576,
        crop: 'center',
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      {
        name: 'large',
        width: 1200,
        // height: null, // Maintain aspect ratio
        formatOptions: { format: 'webp', options: { quality: 90 } },
      },
    ],
    adapter: 'vercel-blob',
    // staticDir: path.resolve(dirname, '../../public/media'),
  },
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        console.log(req.user)
        console.log(operation)

        if (!req.user) return data

        if (operation === 'create') {
          data.uploadedBy = req.user.id
        }
        if (operation === 'update') {
          data.updatedBy = req.user.id
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Public Image/Video', value: 'public' },
        { label: 'Private Image/Video', value: 'private' },
      ],
      defaultValue: 'public',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Public = visible on listings & to everyone. Private = only you & admin can view',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text / Description',
      admin: {
        description: 'Describe the file content (required for accessibility and admin search)',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Caption (for product images)',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'product',
        description: 'Optional rich caption/description shown with the image on the listing',
      },
    },
    {
      name: 'receiptNote',
      type: 'textarea',
      label: 'Receipt Note',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'receipt',
        description: 'Add details like transfer reference, amount paid, date, etc.',
      },
    },
  ],
}
