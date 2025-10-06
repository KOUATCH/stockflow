import { handlers } from "@/auth"

// Force Node.js runtime to allow Prisma and bcrypt to work
export const runtime = 'nodejs'

export const { GET, POST } = handlers