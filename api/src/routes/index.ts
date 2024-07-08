import { createRouter, Result } from 'aeria'

export const router = createRouter()

router.GET('/ticket/filter', async (context) => {
    const document = context.request.query.document;
    const status = context.request.query.status;
    const priority = context.request.query.priority;

    const filtros: any = {};
    if (document) {
        filtros.title = { $regex: `^${document}`, $options: 'i' };
    }
    if (status) {
        filtros.status = status;
    }
    if (priority) {
        filtros.priority = priority;
    }   
    
    console.log('Filtros aplicados:', filtros);

    const { error, result: tickets } = await context.collections.ticket.functions.getAll({
        filters: filtros
    });
    console.log('Resultado da consulta:', tickets);


    if (error) {
        return Result.error(error);
    }

    return Result.result(tickets);
}, {
    query: {
        required: [],
        variable: true,
        type: "object", 
        properties: {
            document: {
                type: "string"
            },
            status: {
                type: "string",
                enum: ["Open", "In Progress", "Closed"]
            },
            priority: {
                type: "string",
                enum: ["Low", "Moderate", "Urgent"]
            }
        }
    }
});
