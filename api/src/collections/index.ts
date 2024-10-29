import { extendTopicCollection } from "../../.aeria/out/collections/topic.mjs";

export * from "../../.aeria/out/collections/index.mjs";
export { ticket } from "./tickets.js";
export { comment } from "./comment.js"
export const topic = extendTopicCollection({
  description: {
    individualActions: {
      createSecret: {
        label: "Criar Token",
        icon: "barcode",
        button: true,
      },
    },
    tableMeta: ["comment_count"],
    properties: {
      comment_count: {
        getter: (doc: any) => {
          return `${doc.comment}`;
        },
      },
    },
  },
});
