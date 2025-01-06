import { FcmWinstonLogger } from '@fcm/shared/logging'
import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client/extension'

const logger = FcmWinstonLogger.getInstance()

export const auditExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'auditLogging',
    query: {
      $allModels: {
        async create({ model, args, query }) {
          if (model != 'UserSearch') {
            return query(args)
          }

          logger.debug(
            'create. \n model : ' +
              model +
              '\n args: ' +
              JSON.stringify(args) +
              '\n query : ' +
              query
          )

          // Capture data before creation)
          const result = await query(args)

          // Log the creation in the AuditLog
          await client.auditLog.create({
            data: {
              action: 'CREATE',
              tableName: model,
              recordId: result.id?.toString() || '',
              userId: '',
              timestamp: new Date(),
              oldData: '',
              newData: JSON.stringify(result),
            },
          })

          return result
        },

        async update({ model, args, query }) {
          if (model != 'UserSearch') {
            return query(args)
          }

          logger.debug(
            'update. \n model : ' +
              model +
              '\n args: ' +
              JSON.stringify(args) +
              '\n query : ' +
              query
          )

          // Capture data before modification
          const oldData = await (client as PrismaClient)[
            model.toLowerCase()
          ].findUnique({
            where: args.where,
          })

          const result = await query(args)

          // Log the update in the AuditLog
          await client.auditLog.create({
            data: {
              action: 'UPDATE',
              tableName: model,
              recordId: result.id?.toString() || '',
              userId: '', // Get the current user ID from context
              timestamp: new Date(),
              newData: JSON.stringify(result),
              oldData: JSON.stringify(oldData),
            },
          })

          return result
        },

        async delete({ model, args, query }) {
          if (model != 'UserSearch') {
            return query(args)
          }

          logger.debug(
            'delete. \n model : ' +
              model +
              '\n args: ' +
              JSON.stringify(args) +
              '\n query : ' +
              query
          )

          // Capture data before deletion
          const oldData = await (client as PrismaClient)[
            model.toLowerCase()
          ].findUnique({
            where: args.where,
          })

          const result = await query(args)

          // Log the deletion in the AuditLog
          await client.auditLog.create({
            data: {
              action: 'DELETE',
              tableName: model,
              recordId: oldData.id,
              oldData: JSON.stringify(oldData),
              newData: '',
              userId: '', // Get the current user ID from context
              timestamp: new Date(),
            },
          })

          return result
        },
      },
    },
  })
})
