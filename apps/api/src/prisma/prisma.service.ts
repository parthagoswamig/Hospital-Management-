import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Singleton instance for serverless optimization
let prismaInstance: PrismaClient | null = null;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    // Return existing instance if available (serverless optimization)
    if (prismaInstance) {
      return prismaInstance as PrismaService;
    }

    super({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      errorFormat: 'minimal',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    prismaInstance = this;
  }

  // TokenBlacklist helper methods for auth module
  tokenBlacklist = {
    findUnique: async (args: { where: { jti: string; tenantId: string } }) => {
      return this.refreshToken.findFirst({
        where: {
          jti: args.where.jti,
          tenantId: args.where.tenantId,
        },
      });
    },

    upsert: async (args: {
      where: { jti: string; tenantId: string };
      update: { revoked: boolean; reason: string; updatedAt: Date };
      create: {
        jti: string;
        userId: string;
        tenantId: string;
        token: string;
        expiresAt: Date;
        revoked: boolean;
        reason: string;
      };
    }) => {
      return this.refreshToken.upsert({
        where: {
          jti: args.where.jti,
        },
        update: args.update,
        create: args.create,
      });
    },

    updateMany: async (args: {
      where: { userId: string; tenantId: string };
      data: { revoked: boolean; reason: string; updatedAt: Date };
    }) => {
      return this.refreshToken.updateMany({
        where: {
          userId: args.where.userId,
          tenantId: args.where.tenantId,
        },
        data: args.data,
      });
    },
  };

  async onModuleDestroy() {
    // In serverless, don't disconnect - reuse connections
    if (process.env.NODE_ENV !== 'production') {
      await this.$disconnect();
    }
  }
}
