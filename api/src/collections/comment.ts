import { CollectionItemWithId, InsertPayload, ObjectId, insert as originalInsert, Result } from "aeria";
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
            const {error,result} = await originalInsert(payload, context);
            //return insertEither
            if(error){
                return Result.error(error)
            }
            const allNumbers = await context.collections.comment.model.aggregate<PhoneNumbers>([
                {
                    $match: {
                        ticket: new ObjectId('671aa2593ec89b413a0f797c')
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
                                    as:"owner"
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
                }
            ]).next()

            if (allNumbers){
                for(const phone of allNumbers.phones){
                    whatsappMessage(phone, result.description, result.images?.map(image => image.absolute_path)).catch(console.trace)
                }
            }
            
            return Result.result(result)
        }
    }
})