export * from "../.aeria/out/collections/index.mjs";
import { throwIfError } from "aeria";
import { extendTicketCollection } from "../.aeria/out/index.mjs";

export const ticket = extendTicketCollection({
  description: {
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
    properties: {
      comments: {
        getter: async (document, context): Promise<unknown> => {
          return throwIfError(await context.collections.comment.functions.getAll({
            filters: {
              ticket: document._id
            },
            populate: [
              'owner',
              'images',
            ],
          }))
        }
      }
    }
  },
});
