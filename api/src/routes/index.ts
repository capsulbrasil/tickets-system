import {
  createRouter,
  endpointErrorSchema,
  HTTPStatus,
  log,
  Result,
  resultSchema,
} from "aeria";
import { countAllContracts } from "../contracts/countAllContracts.js";
import { ticket } from "../collections/tickets.js";
import { comment } from "../collections/index.js";

export const router = createRouter();

router.GET(
  "/countAll",
  async (context) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const aggregationPipeline = [
      { $match: { status: { $ne: null } } },
      {
        $facet: {
          totalByStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          totalByTopic: [
            {
              $lookup: {
                from: "topic",
                localField: "topic",
                foreignField: "_id",
                as: "lookUpTopic",
              },
            },
            {
              $unwind: {
                path: "$lookUpTopic",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$lookUpTopic.title",
                count: { $sum: 1 },
              },
            },
          ],
          UrgentTickets: [
            {
              $match: {
                $or: [
                  { status: "Ativo", created_at: { $lt: twentyFourHoursAgo } },
                  {
                    status: "Reparando",
                    created_at: { $lt: twentyFourHoursAgo },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          totalByStatus: {
            $arrayToObject: {
              $map: {
                input: "$totalByStatus",
                as: "status",
                in: {
                  k: "$$status._id",
                  v: "$$status.count",
                },
              },
            },
          },
          totalByTopic: {
            $arrayToObject: {
              $map: {
                input: "$totalByTopic",
                as: "topic",
                in: {
                  k: { $toString: "$$topic._id" },
                  v: "$$topic.count",
                },
              },
            },
          },
          UrgentTickets: 1,
        },
      },
    ];

    const result = await context.collections.ticket.model
      .aggregate(aggregationPipeline)
      .next();

    if (!result) {
      return context.error(HTTPStatus.InternalServerError, {
        code: "TICKET_COUNT_AGGREGATION_FAILED",
      });
    }
    return Result.result(result);
  },
  countAllContracts
);

router.GET("/addComment", async (context) => {
  const { id, what } = context.request.payload;

  const { result } = await context.collections.comment.functions.insert({
    what: what as any,
  });

  return context.collections.ticket.functions.insert({
    what: { _id: id as any, comment: result?._id },
  });
});
