import { createRouter, endpointErrorSchema, HTTPStatus, Result, resultSchema, type Filters } from "aeria";
import { ticket } from "../collections.js";

export const router = createRouter();

router.GET("/ticket/filter", async (context) => {
    const document = context.request.query.document;
    const status = context.request.query.status;
    const priority = context.request.query.priority;
    const limit = context.request.query.limit;
    const filters: Filters<typeof ticket.item> = {}

    if (document) {
      filters.title = { $regex: `${document}`, $options: "i" };
    }
    if (priority) {
      filters.priority = priority;
    }

    const options: Parameters<typeof context.collections.ticket.functions.getAll>[0] = {};
    if (limit) {
      options.offset = 0
      options.limit = Number(limit);
    }
    if (status){
      const { error, result: tickets } =
      await context.collections.ticket.functions.getAll({
        filters:{
          status: status,
          ...filters
        },
        ...options
      });
      if (error) {
        context.error(HTTPStatus.NotFound, {code:'NO_TICKETS_FOUND'});
      }
      if (status === "Open"){
        return Result.result({
          openTickets:tickets,
          repairingTickets:[],
          completedTickets:[]
        });
      }
      if (status === "Repairing"){
        return Result.result({
          openTickets:[],
          repairingTickets: tickets,
          completedTickets:[]
        });
      }
      if(status === "Completed"){
        return Result.result({
          openTickets:[],
          repairingTickets:[],
          completedTickets:tickets
        });
      }
    }
    const {error: openErrorTickets,result: openTickets } = await context.collections.ticket.functions.getAll({
      filters:{
        status:'Open',
        ...filters
      },
      ...options
    });
    const {error: repairingErrorTickets,result: repairingTickets} = await context.collections.ticket.functions.getAll({
      filters:{
        status:'Repairing',
        ...filters
      },
      ...options
    });
    const {error: completedErrorTickets,result: completedTickets} = await context.collections.ticket.functions.getAll({
      filters:{
        status:'Completed',
        ...filters
      },
      ...options
    });
    if(openErrorTickets && repairingErrorTickets && completedErrorTickets){
      context.error(HTTPStatus.NotFound, {code:'NO_TICKETS_FOUND'})
    }
    return Result.result({
      openTickets,
      repairingTickets,
      completedTickets
    });
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
          enum: ["Low", "Moderate", "Urgent"],
        },
        offset: {
          type: "number",
        },
        limit:{
          type: "number"
        }
      },
    },
    response:[
      endpointErrorSchema({
        httpStatus:[HTTPStatus.NotFound],
        code: ["NO_TICKETS_FOUND"]
      }),
      resultSchema({
        type:'object',
        properties:{
          openTickets:{
            type:'array',
            items:{
              $ref:'ticket'
            }
          },
          repairingTickets:{
            type:'array',
            items:{
              $ref:'ticket'
            }
          },
          closedTickets:{
            type:'array',
            items:{
              $ref:'ticket'
            }
          },
        }
      })
    ]
  }
);

router.GET('/ticket/countAll', async (context) => {
  const {error: openErrorTickets,result: openTickets } = await context.collections.ticket.functions.count({
    filters:{
      status:'Open',
    },
  });
  const {error: repairingErrorTickets,result: repairingTickets} = await context.collections.ticket.functions.count({
    filters:{
      status:'Repairing',
    },
  });
  const {error: completedErrorTickets,result: completedTickets} = await context.collections.ticket.functions.count({
    filters:{
      status:'Completed',
    },
  });
  if(openErrorTickets && repairingErrorTickets && completedErrorTickets){
    context.error(HTTPStatus.NotFound, {code:'NO_TICKETS_FOUND'})
  }
  return Result.result({
    openTickets,
    repairingTickets,
    completedTickets
  });
},
{
  response:[
    endpointErrorSchema({
      httpStatus:[HTTPStatus.NotFound],
      code: ["NO_TICKETS_FOUND"]
    }),
    resultSchema({
      type:'object',
      properties:{
        openTickets:{
          type:'number',
        },
        repairingTickets:{
          type:'number',
        },
        closedTickets:{
          type:'number',
        },
      }
    })
  ]
})
