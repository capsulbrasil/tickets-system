import {
  defineContract,
  endpointErrorSchema,
  resultSchema,
  HTTPStatus,
  ACError,
} from "aeria";

export const countAllContracts = defineContract({
  roles: true,
  response: [
    endpointErrorSchema({
      httpStatus: [HTTPStatus.InternalServerError],
      code: ["TICKET_COUNT_AGGREGATION_FAILED"],
    }),
    resultSchema({
      type: "object",
      properties: {
        totalByStatus: {
          type: "object",
          properties: {
            Ativo: {
              type: "number",
            },
            Reparando: {
              type: "number",
            },
            Resolvido: {
              type: "number",
            },
          },
        },
        totalByTopic: {
          type: "array",
          items: {
            $ref: "topic",
          },
        },
        UrgentCount: {
          type: "number",
        },
      },
    }),
  ],
});
