import { createRouter, HTTPStatus } from "aeria";
import { generateSecretKey } from "../integrations/keyGenerator.js";

export const topicRouter = createRouter();

topicRouter.POST(
  "/createSecret",
  async (context) => {
    const payload = context.request.payload as any;
    const { error, result: topic } =
      await context.collections.topic.functions.get({
        filters: {
          _id: payload._id,
          secret_key: {
            $exists: false,
          },
        },
      });

    if (error) {
      return context.error(HTTPStatus.BadRequest, {
        code: "KEY_ALREADY_CREATED",
      });
    }

    const newKey = await generateSecretKey(topic._id.toString());

    return context.collections.topic.functions.insert({
      what: {
        _id: topic._id,
        secret_key: newKey,
      },
    });
  },
  {
    roles: ["root"],
    payload: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
      },
    },
  }
);
