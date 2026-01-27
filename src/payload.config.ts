import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { getWelcomeEmail1HTML, getWelcomeEmail2HTML } from './lib/email-templates'
import { CSRF_WHITELIST_DOMAIN, SERVER_URL } from './lib/config'
import { CoursesCollection } from './collections/Courses'
import { Enrollments } from './collections/Enrollments'
import { Tags } from './collections/Tags'
import { CoursePurchases } from './collections/CoursePurchases'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    autoRefresh: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Users, Media, CoursesCollection, Enrollments, Tags, CoursePurchases],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: true,
    },
  }),
  sharp,
  plugins: [],

  // ChiTheDev Effect
  upload: {},
  serverURL: SERVER_URL,
  email: nodemailerAdapter({
    defaultFromAddress: 'notification@myforexsignatureacademy.com',
    defaultFromName: `${process.env.NEXT_PUBLIC_APP_NAME} Team`,
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
  cors: {
    origins: [CSRF_WHITELIST_DOMAIN, SERVER_URL, '*'],
    headers: ['x-custom-header'],
  },
  csrf: [CSRF_WHITELIST_DOMAIN, SERVER_URL, '*'],
  jobs: {
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }

      defaultJobsCollection.admin.hidden = false
      return defaultJobsCollection
    },

    tasks: [
      {
        slug: 'sendWelcomeEmail',
        retries: 3,
        inputSchema: [
          {
            name: 'userEmail',
            type: 'email',
            required: true,
          },
          {
            name: 'userFullname',
            type: 'text',
            required: true,
          },
        ],
        handler: async ({ input, req }) => {
          await req.payload.sendEmail({
            to: input.userEmail,
            subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}`,
            html: getWelcomeEmail1HTML({ userFullname: input.userFullname }),
            from: 'ekene@myforexsignatureacademy.com',
            sender: 'ekene@myforexsignatureacademy.com',
          })

          return {
            output: {
              emailSent: true,
            },
          }
        },
      },

      // WELCOME SERIES 2
      {
        slug: 'sendPromotionalWelcomeEmail',
        retries: 3,
        inputSchema: [
          {
            name: 'userEmail',
            type: 'email',
            required: true,
          },
          {
            name: 'userFullname',
            type: 'text',
            required: true,
          },
        ],
        handler: async ({ input, req }) => {
          await req.payload.sendEmail({
            to: input.userEmail,
            subject: `Getting Started With ${process.env.NEXT_PUBLIC_APP_NAME}`,
            html: getWelcomeEmail2HTML({ userFullname: input.userFullname }),
            from: 'ekene@myforexsignatureacademy.com',
            sender: 'ekene@myforexsignatureacademy.com',
          })

          return {
            output: {
              emailSent: true,
            },
          }
        },
      },
    ],

    autoRun: [
      {
        cron: '*/5 * * * *', // Run every 5 minutes
      },
    ],
  },
})
