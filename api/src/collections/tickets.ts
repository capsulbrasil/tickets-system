import {
  InsertPayload,
  insert as originalInsert,
} from "aeria";
import {
  extendTicketCollection,
  Ticket,
  ticketCollection,
} from "../../.aeria/out/collections/ticket.mjs";
import { discordAPI } from "../integrations/index.js";
import { MessageCreateOptions } from "discord.js";
import { comment } from "../../.aeria/out/collections/comment.mjs";

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
      const insertEither = await originalInsert(payload, context);
      if (insertEither.result && context.token.authenticated === true) {
        const { title, status, description, priority, attached, owner, _id } =
          insertEither.result;
        const files: NonNullable<MessageCreateOptions["files"]>[number][] = [];
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
        const { result: topic } = await context.collections.topic.functions.get(
          {
            filters: { _id: payload.what.topic },
          }
        );
        const { error } = await discordAPI.sendMessage({
          channelId: topic?.discord_channel_id as string,
          message: {
            content: `## **Novo Ticket:** [${title}](${
              "https://suporte.capsulbrasil.com.br/dashboard/ticket-" + _id
            })\n> ### **Criado por:** ${
              owner?.name
            }\n> ### **Prioridade:** ${priority}\n> **Descrição:** ${description}`,
            files,
          },
        });

        if (comment) {
          const { error: commentError } = await discordAPI.sendMessage({
            channelId: topic?.discord_channel_id as string,
            message: {
              content: `**${comment}**\n>"${comment}"`,
            },
          });

          if (commentError) {
            console.error(
              "Erro ao enviar a mensagem de comentário:",
              commentError
            );
          }
        }

        if (error) {
          console.error("Error sending ticket notification:" + error);
        }
      }
      return insertEither;
    },
  },
});
