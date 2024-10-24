import { registerStore, useStore, createCollectionStore } from "aeria-ui";

export const customer = registerStore((context) =>
  createCollectionStore(
    {
      $id: "ticket",
      state: {},
      actions: () => ({
        viewContent(ticket: { _id: string }) {
          //@ts-ignore
          ROUTER.push({
            path: "/dashboard/ticket-" + ticket._id,
          });
        },
      }),
    },
    context
  )
);
