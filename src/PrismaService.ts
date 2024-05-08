import { singleton } from 'tsyringe'
import { PrismaClient } from '@prisma/client'

@singleton()
export class PrismaService extends PrismaClient {}
