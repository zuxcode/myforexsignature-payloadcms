import type { Payload } from 'payload'
import type { User } from './payload-types'

export const seed = async (payload: Payload): Promise<void> => {
  // Local API methods skip all access control by default
  // so we can easily create an admin user directly in init
  await payload.create<any,  User>({
    collection: 'users',
    data: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_EMAIL,
      first_name: 'Alfred',
      last_name: 'Joseph',
      roles: ['admin'],
    },
  })
}
