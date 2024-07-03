import { createRouter, Result } from 'aeria'

export const router = createRouter()

router.GET('/ticket/filter', async (context) => {
    const document = context.request.query.document;
    const {error, result: tickets} = await context.collections.ticket.functions.getAll({
        filters: {
            title: { $regex: document, $options: 'i' } 
        }
    });
    if (error) {
        return Result.error(error);
    }

    return Result.result(tickets); 
},
{
    query: {
        type: "object", 
        properties: {
            document: {
                type: "string"
            }
        }
    }
});

