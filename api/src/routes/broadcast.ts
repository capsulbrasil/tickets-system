import { createRouter, HTTPStatus, Result } from "aeria";
import { broadcastGatewayContract } from "../contracts/broadcastGatewatContract.js";

export const broadcastRouter = createRouter()

broadcastRouter.GET("/gateway", async (context) => {
    const query = context.request.query
    const headers = context.request.headers
    const xClientToken = headers['x-client-token']
    const {error: noTopic, result:topic} = await context.collections.topic.functions.get({
      filters:{
        secret_key: xClientToken
      }
    })
    if(noTopic){
        return Result.error(noTopic)
    }
    const {error: noBroadcast, result: broadcast} = await context.collections.broadcast.functions.getAll({
        filters:{
            system: topic._id
        },
        offset:Number(query.offset),
        limit: 10,
    })
    if(noBroadcast){
        return Result.error(noBroadcast)
    }
    return Result.result(broadcast)
  }, broadcastGatewayContract)