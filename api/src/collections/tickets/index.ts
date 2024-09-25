export * from "../../../../api/.aeria/out/collections/index.mjs";
import { throwIfError } from "aeria";
import { extendTicketCollection } from "../../../../api/.aeria/out/index.mjs";

export const ticket = extendTicketCollection({
  description: {
    freshItem: {
      status: "Open",
    },
    properties: {
      comments: {
        noForm: true,
        getter: async (document: any, context: any): Promise<unknown> => {
          return throwIfError(
            await context.collections.comment.functions.getAll({
              filters: {
                ticket: document._id,
              },
              populate: ["owner", "images"],
            })
          );
        },
      },
    },
    individualActions: {
      viewContent: {
        label: "Ver ticket",
        icon: "magnifying-glass",
      },
    },
  },
});
