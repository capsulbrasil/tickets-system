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
      const insertEither = await originalInsert(payload, context);
      if (insertEither.result && context.token.authenticated === true) {
        const { title, status, description, priority, attached, owner } =
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
          channelId: topic?.id as string,
          message: {
            content: `__**Ticket criado por ${owner?.name}**__\nTítulo: ${title}\nDescrição: ${description}\nStatus: ${status}\nPrioridade: ${priority}`,
            files,
          },
        });
        if (error) {
          console.error("Error sending ticket notification:" + error);
        }
      }
      return insertEither;
    },
  },
});
