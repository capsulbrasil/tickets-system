export * from "../.aeria/out/collections/index.mjs";
import { extendTicketCollection, Ticket } from "../.aeria/out/index.mjs";
import { get, getAll, Result, throwIfError } from "aeria";

export const ticket = extendTicketCollection({
  description: {
    owned: "on-write",
    freshItem: {
      status: "Open",
    },
    formLayout: {
      fields: {
        comments: {
          if: {
            operator: "truthy",
            term1: "_id",
          },
        },
      },
    },
  },
  functions: {
    get: async (payload, context) => {
      const { error, result: ticket } = await get(payload, context);
      if (error) {
        return Result.error(error);
      }
      // @ts-expect-error
      ticket.comments = throwIfError(
        await context.collections.comment.functions.getAll({
          filters: {
            // @ts-expect-error
            ticket: ticket._id,
          },
        })
      );

      return Result.result(ticket);
    },
    getAll: async (payload, context) => {
      const { error, result } = await getAll(payload, context);
      if (error) {
        return Result.error(error);
      }

      const tickets: Ticket[] = [];
      for (const ticket of result as Ticket[]) {
        tickets.push({
          ...ticket,
          comments: throwIfError(
            await context.collections.comment.functions.getAll({
              filters: {
                // @ts-expect-error
                ticket: ticket._id,
              },
            })
          ),
        });
      }

      return Result.result(tickets);
    },
  },
});
