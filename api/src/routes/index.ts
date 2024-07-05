import { createRouter, log, Result } from 'aeria'

export const router = createRouter()

router.GET('/ticket/filter', async (context) => {
    const document = context.request.query.document;
    const status = context.request.query.status;
    const {error, result: tickets} = await context.collections.ticket.functions.getAll({
        filters: { title: { $regex: `^${document}`, $options: 'i'},  status },
    });
    console.log(error)
    if (error) {
        return Result.error(error);
    }

    return Result.result(tickets); 
},
{
    query: {
        variable: true,
        type: "object", 
        properties: {
            document: {
                type: "string"
            },
            status: {
                type: "string",
                enum: ["Open", "In Progress", "Closed"]
            }
        }
        
    }
});

