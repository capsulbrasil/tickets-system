export * from '../.aeria/out/collections/index.mjs'
import { extendTicketCollection, Ticket } from '../.aeria/out/index.mjs'
import { get, getAll, Result } from 'aeria'

export const ticket = extendTicketCollection({
  description: {
    formLayout: {
      fields: {
        comments: {
          if: {
            operator: 'truthy',
            term1: '_id',
          }
        }
      }
    }
  },
  functions: {
    get: async (payload, context) => {
      const { error, result: ticket } = await get(payload, context)
      if( error ) {
        return Result.error(error)
      }

      const { error: commentError, result: comments } = await context.collections.comment.functions.getAll({
        filters: {
          ticket: ticket._id,
        }
      })

      if( commentError ) {
        return Result.error(commentError)
      }

      ticket.comments = comments
      return Result.result(ticket)
    },
    getAll: async (payload, context) => {
      const { error, result } = await getAll(payload, context)
      if( error ) {
        return Result.error(error)
      }

      const tickets: Ticket[] = []
      for( const ticket of result as Ticket[] ) {
        const { error, result: comments } = await context.collections.comment.functions.getAll({
          filters: {
            ticket: ticket._id,
          }
        })

        if( error ) {
          return Result.error(error)
        }

        tickets.push({
          ...ticket,
          comments,
        })
      }

      return Result.result(tickets)
    },
  },
})

