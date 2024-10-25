import {
  InsertPayload,
  throwIfError,
  insert as originalInsert,
  Result,
} from "aeria";
import {
  extendTicketCollection,
  Ticket,
  ticketCollection,
} from "../../.aeria/out/collections/ticket.mjs";
import { discordAPI } from "../integrations/index.js";
import { MessageCreateOptions } from "discord.js";

export const ticket = extendTicketCollection({
  description: {
    freshItem: {
      status: "Ativo",
    },
    individualActions: {
      viewContent: {
        label: "Ver ticket",
        icon: "magnifying-glass",
        button: true,
      },
    },
    tableLayout: {
      actions: {
        viewContent: {
          button: true,
        },
      },
    },
  },
  functions: {
    insert: async (payload: InsertPayload<Ticket>, context) => {
      const isStatusUpdate = payload.what.comment == null;
      const insertEither = await originalInsert(payload, context);

      if (insertEither.result && context.token.authenticated === true) {
        const {
          title,
          description,
          priority,
          attached,
          owner,
          _id,
          comment,
          observation,
          status,
        } = insertEither.result;

        if (isStatusUpdate) {
          const { result: topic } =
            await context.collections.topic.functions.get({
              filters: { _id: payload.what.topic },
            });

          const { error: statusError } = await discordAPI.sendMessage({
            channelId: topic?.discord_channel_id as string,
            message: {
              content: `@everyone\n> Status atualizado: [${title}](${
                "https://suporte.capsulbrasil.com.br/dashboard/ticket-" + _id
              }) foi alterado para **${status}**.`,
            },
            notFromMainServer: true,
          });

          if (statusError) {
            console.error("Error sending status update message:", statusError);
          }
        }

        if (!isStatusUpdate && comment) {
          const { result: topic } =
            await context.collections.topic.functions.get({
              filters: { _id: payload.what.topic },
            });

          const { error: commentError } = await discordAPI.sendMessage({
            channelId: topic?.discord_channel_id as string,
            message: {
              content: `@everyone\n> [${comment?.owner?.name}](${
                "https://suporte.capsulbrasil.com.br/dashboard/c/user/" +
                comment.owner?._id
              }) comentou no ticket [${title}](${
                "https://suporte.capsulbrasil.com.br/dashboard/ticket-" + _id
              }): ${comment.description}`,
            },
            notFromMainServer: true,
          });

          if (commentError) {
            console.error("Error sending comment message:", commentError);
          }
        }

        if (!payload.what._id) {
          const files: NonNullable<MessageCreateOptions["files"]>[number][] =
            [];

          if (attached) {
            files.push({
              attachment: Buffer.from(
                await (await fetch(attached.download_link)).arrayBuffer()
              ),
              name: `attachment.jpeg`,
            });
          } else {
            console.warn(
              `Unable to get ticket topic inserted by ${owner?.email}`
            );
          }
          const { result: topic } =
            await context.collections.topic.functions.get({
              filters: { _id: payload.what.topic },
            });
          const { error } = await discordAPI.sendMessage({
            channelId: topic?.discord_channel_id as string,
            message: {
              content: `### **Novo Ticket:** [${title}](${
                "https://suporte.capsulbrasil.com.br/dashboard/ticket-" + _id
              })\n> **Criado por:** ${
                owner?.name
              }\n> **Prioridade:** ${priority}\n> **Descrição:** ${description}\n>>> **Observação:** ${observation}`,
              files,
            },
          });

          if (error) {
            console.error("Error sending ticket notification:" + error);
          }
        }
      }
      return insertEither;
    },
  },
});
