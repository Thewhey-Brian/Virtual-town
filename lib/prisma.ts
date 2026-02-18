import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient
  pgPool: Pool 
}

// Create PostgreSQL connection pool
const createPool = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  return new Pool({
    connectionString,
    max: 10,
  })
}

// Create Prisma client with adapter
const createPrismaClient = () => {
  const pool = globalForPrisma.pgPool || createPool()
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = pool
  }
  
  const adapter = new PrismaPg(pool)
  
  const options: Prisma.PrismaClientOptions = {
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] as Prisma.LogLevel[] 
      : ['error'] as Prisma.LogLevel[],
  }
  
  return new PrismaClient({
    adapter,
    ...options,
  })
}

// Export singleton instance
export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
