import { extendTopicCollection } from "../../.aeria/out/index.js";

export const topic = extendTopicCollection({
    description: {
      individualActions: {
        createSecret: {
          label: "Criar Token",
          icon: "barcode",
        },
      },
      tableLayout: {
        actions: {
          createSecret: {
            button: true,
          },
        },
      },
    },
  });
  