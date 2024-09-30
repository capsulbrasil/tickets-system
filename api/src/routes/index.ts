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
            $group: {
              _id: "$topic.title",
              count: { $sum: 1 },
            },
          },
        ],
        urgentTickets: [
          {
            $match: {
              $or: [
                { status: "Open", created_at: { $lt: twentyFourHoursAgo } },
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
        totalByTopic: "$totalByTopic",
        urgentCount: { $arrayElemAt: ["$urgentTickets.urgentCount", 0] },
      },
    },
  ];

  const result = await context.collections.ticket.model
    .aggregate(aggregationPipeline)
    .toArray();

  context.body = {
    totalByStatus: result[0].totalByStatus,
    totalByTopic: result[0].totalByTopic,
    urgentCount: result[0].urgentCount || 0,
  };
});
