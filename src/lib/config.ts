export const CSRF_WHITELIST_DOMAIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : // : 'https://myforexsignatureacademy.com'
      'https://myforexsignature.vercel.app'

export const SERVER_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://myforexsignature-payloadcms.vercel.app/'
