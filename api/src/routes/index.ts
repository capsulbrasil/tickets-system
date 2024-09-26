import {
  createRouter,
  endpointErrorSchema,
  HTTPStatus,
  Result,
  resultSchema,
} from "aeria";

export const router = createRouter();

router.GET(
  "/ticket/countAll",
  async (context) => {
    try {
      const { error: openErrorTickets, result: openTickets } =
        await context.collections.ticket.functions.count({
          filters: {
            status: "Open",
          },
        });

      const { error: repairingErrorTickets, result: repairingTickets } =
        await context.collections.ticket.functions.count({
          filters: {
            status: "Repairing",
          },
        });

      const { error: completedErrorTickets, result: completedTickets } =
        await context.collections.ticket.functions.count({
          filters: {
            status: "Completed",
          },
        });

      if (openErrorTickets || repairingErrorTickets || completedErrorTickets) {
        return context.error(HTTPStatus.NotFound, {
          code: "NO_TICKETS_FOUND",
        });
      }

      return Result.result({
        openTickets,
        repairingTickets,
        completedTickets,
      });
    } catch (err) {
      return context.error(HTTPStatus.InternalServerError, {
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  },
  {
    response: [
      endpointErrorSchema({
        httpStatus: [HTTPStatus.NotFound, HTTPStatus.InternalServerError],
        code: ["NO_TICKETS_FOUND", "INTERNAL_SERVER_ERROR"],
      }),
      resultSchema({
        type: "object",
        properties: {
          openTickets: {
            type: "number",
          },
          repairingTickets: {
            type: "number",
          },
          completedTickets: {
            type: "number",
          },
        },
      }),
    ],
  }
);
