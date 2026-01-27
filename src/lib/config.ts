export const CSRF_WHITELIST_DOMAIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://myforexsignatureacademy.com'
export const SERVER_URL = 'http://localhost:3001'
