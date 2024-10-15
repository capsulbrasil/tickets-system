import {
  ACError,
  defineContract,
  endpointErrorSchema,
  genericEndpointErrorSchema,
  HTTPStatus,
  resultSchema,
} from "aeria";

export const broadcastGatewayContract = defineContract({
  roles: "unauthenticated",
  query: {
    type: "object",
    properties: {
      offset: {
        type: "number",
      },
    },
  },
  response: [
    genericEndpointErrorSchema(),
    endpointErrorSchema({
      httpStatus: [
        HTTPStatus.BadRequest,
        HTTPStatus.Forbidden,
        HTTPStatus.NotFound,
      ],
      code: [
        ACError.MalformedInput,
        ACError.OwnershipError,
        ACError.ResourceNotFound,
        "NO_BROADCASTS_FOUND",
      ],
    }),
    resultSchema({
      type: "array",
      items: {
        type: "object",
        $ref: "topic",
      },
    }),
  ],
});
