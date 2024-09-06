import { createRouter, Result } from "aeria";

export const router = createRouter();

router.GET(
  "/ticket/filter",
  async (context) => {
    const document = context.request.query.document;
    const status = context.request.query.status;
    const offset = context.request.query.offset;
    const priority = context.request.query.priority;
    const filters: any = {};

    if (document) {
      filters.title = { $regex: `${document}`, $options: "i" };
    }
    if (status) {
      filters.status = status;
    }
    if (priority) {
      filters.priority = priority;
    }

    const options: any = { filters };
    if (!document && !priority) {
      options.offset = Number(offset);
      options.limit = 7;
    }

    const { error, result: tickets } =
      await context.collections.ticket.functions.getAll(options);

    if (error) {
      return Result.error(error);
    }
    return Result.result(tickets);
  },
  {
    query: {
      required: [],
      variable: true,
      type: "object",
      properties: {
        document: {
          type: "string",
        },
        status: {
          type: "string",
          enum: ["Open", "Repairing", "Completed"],
        },
        priority: {
          type: "string",
          enum: ["low", "Moderate", "Urgent"],
        },
        offset: {
          type: "number",
        },
      },
    },
  }
);
