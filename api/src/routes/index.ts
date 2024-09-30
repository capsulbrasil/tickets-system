import {
  createRouter,
  endpointErrorSchema,
  HTTPStatus,
  log,
  Result,
  resultSchema,
} from "aeria";

export const router = createRouter();

router.GET("/countAll", async (context) => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const aggregationPipeline = [
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
            $lookup:{
              from:'topic',
              localField:"topic",
              foreignField:"_id",
              as: "lookUpTopic"
            }
          },
          {
            $unwind:{
              path:"$lookUpTopic",
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $group: {
              _id: "$lookUpTopic.title",
              count: { $sum: 1 },
            },
          },
        ],
        urgentTickets: [
          {
            $match: {
              $or: [
                { status: "Open", 
                  created_at: { $lt: twentyFourHoursAgo } 
                },
                {
                  status: "Repairing",
                  created_at: { $lt: twentyFourHoursAgo },
                },
              ],
            },
          },
          {
            $count: "urgentCount",
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
                k: "$$topic._id",
                v: "$$topic.count",
              },
            },
          },
        },
        urgentCount: { $arrayElemAt: ["$urgentTickets.urgentCount", 0] },
      },
    },
  ];

  const result = await context.collections.ticket.model.aggregate(aggregationPipeline).next();

  if(!result){
    return context.error(HTTPStatus.InternalServerError, {code:"TICKET_COUNT_AGGREGATION_FAILED"})
  }
  return Result.result
  /* context.body = {
    totalByStatus: result[0].totalByStatus,
    totalByTopic: result[0].totalByTopic,
    urgentCount: result[0].urgentCount || 0,
  }; */
});
