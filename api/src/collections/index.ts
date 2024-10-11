import { extendTopicCollection } from "../../.aeria/out/collections/topic.mjs";

export * from "../../.aeria/out/collections/index.mjs";
export { ticket } from "./tickets.js";

export const topic = extendTopicCollection({
    description:{
        properties:{
            secret_key:{
                type:'string',
                readOnly:true
            }
        },
        individualActions:{
            createSecret:{
                label:"Criar Token",
                icon:'barcode',
            },
        }
    }
})