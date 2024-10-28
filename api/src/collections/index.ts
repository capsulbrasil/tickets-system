import { extendTopicCollection } from "../../.aeria/out/collections/topic.mjs";

export * from "../../.aeria/out/collections/index.mjs";
export { ticket } from "./tickets.js";

export const topic = extendTopicCollection({
  description: {
    individualActions: {
      createSecret: {
        label: "Criar Token",
        icon: "barcode",
        button: true,
      },
    },
    // properties: {
    //   CommentCount: {
    //     getter: (doc: any) => {
    //       return `${doc.comment}`;
    //     },
    //   },
    // },
  },
});
