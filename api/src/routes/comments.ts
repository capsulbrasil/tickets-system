import { createRouter, HTTPStatus, Result } from "aeria";
export const commentRouter = createRouter();

commentRouter.POST("/addLike", async (context) => {

    const userId = context.token.sub;

    if (!userId){
        return context.error(HTTPStatus.NotFound,{code:'USER_ID_NOT_FOUND'})
    }
  
    const { error: commentError, result: comment } = await context.collections.comment.functions.get({
      filters: {
        _id: context.request.payload.comment_id,
      },
    });
    if (commentError) {
      return Result.result(commentError);
    }

    const updateCommentLike = await context.collections.comment.model.findOneAndUpdate(
      {
        _id: comment._id,
      },
      {
        $push: {
          liked_by: {
            $each: [userId],
          },
        },
      }
    );
  
    if (!updateCommentLike) {
      return context.error(HTTPStatus.InternalServerError, { code: "ERROR_UPDATING_COMMENT" });
    }
    return Result.result(updateCommentLike);
  }, {
    roles: true,
    payload: {
      type: "object",
      properties: {
        comment_id: { type: "string" },
      },
    },
});

commentRouter.POST("/removeLike", async (context) => {

    const userId = context.token.sub;

    if (!userId){
        return context.error(HTTPStatus.NotFound,{code:'USER_ID_NOT_FOUND'})
    }
  
    const { error: commentError, result: comment } = await context.collections.comment.functions.get({
      filters: {
        _id: context.request.payload.comment_id,
      },
    });
    if (commentError) {
      return Result.result(commentError);
    }

    const updateCommentLike = await context.collections.comment.model.findOneAndUpdate(
      {
        _id: comment._id,
      },
      {
        $pull: {
          liked_by:userId
        },
      }
    );
  
    if (!updateCommentLike) {
      return context.error(HTTPStatus.InternalServerError, { code: "ERROR_UPDATING_COMMENT" });
    }
    return Result.result(updateCommentLike);
  }, {
    roles: true,
    payload: {
      type: "object",
      properties: {
        comment_id: { type: "string" },
      },
    },
});

