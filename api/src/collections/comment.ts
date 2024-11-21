import { ACError, HTTPStatus, InsertPayload, ObjectId, insert as originalInsert, Result } from "aeria";
import { extendCommentCollection, Comment } from "../../.aeria/out/collections/comment.mjs";
import { whatsappMessage } from "../integrations/whatsapp.js";

type PhoneNumbers = {
    phones:[
        string
    ]
}

export const comment = extendCommentCollection({
    description:{
        properties:{
            images:{
                type:"array",
                items:{
                    $ref:"file",
                    populate:[
                        "absolute_path"
                    ]
                }
            }
        }
    },
    functions:{
        insert: async (payload: InsertPayload<Comment>, context) => {
            if(!context.token.authenticated){
                return context.error(HTTPStatus.Forbidden, {code:ACError.AuthorizationError})
            }
            const {error,result} = await originalInsert(payload, context);
            if(error){
                return Result.error(error)
            }
            const allNumbers = await context.collections.comment.model.aggregate<PhoneNumbers>([
                {
                    $match: {
                        ticket: payload.what.ticket
                    }
                },
                {
                    $lookup: {
                        from: "ticket",
                        localField: "ticket",
                        foreignField: "_id",
                        pipeline:[
                            {
                                $lookup:{
                                    from:"user",
                                    localField:"owner",
                                    foreignField:"_id",
                                    as:"owner",
                                }
                            },
                            {
                                $unwind:"$owner"
                            },
                            {
                                $project:{
                                    "owner":"$owner.phone_number" 
                                }
                            } 
                        ],
                        as: "ticket"
                    }
                },
                {
                    $unwind: {
                        path: "$ticket",
                    }
                },
                {
                    $lookup:{
                        from:"user",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner"
                    }
                },
                {
                    $unwind:"$owner"
                },
                {
                    $group: {
                        _id: null,
                        ticket_phone: {
                            $push: "$ticket.owner",
                        },
                            comment_phone:{
                            $push:"$owner.phone_number"
                        }
                    }
                },
                {
                    $project: {
                        _id:0,
                        phones:{
                            $setUnion:[
                                "$comment_phone", 
                                "$ticket_phone"
                            ]
                        }
                    }
                },
                {
                    $project:{
                        phones:{
                            $filter:{
                              input:"$phones",
                              as:"phone",
                              cond:{
                                $and:[
                                  {$ne:["$$phone", ""]},
                                  {$ne:["$$phone", null]}
                                ]
                              }
                            }
                        }
                    }
                }
            ]).next()
            if (allNumbers){
                const {error:userError, result:user} = await context.collections.user.functions.get({
                    filters:{
                        _id: context.token.sub
                    }
                })
                if(userError){
                    return Result.error(userError)
                }
                const message = `Comentário feito por *${user.name}*, no ticket *${result.ticket?.title}* https://suporte.capsulbrasil.com.br/dashboard/ticket-${result.ticket?._id} :\n*Comentário:* ${result.description}`
                for(const phone of allNumbers.phones){
                    whatsappMessage(phone, message, result.images?.map(image => image.absolute_path)).catch(console.trace)
                }
            }
            
            return Result.result(result)
        }
    }
})