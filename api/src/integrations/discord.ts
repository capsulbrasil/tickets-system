import {
  Client,
  DiscordAPIError,
  GatewayIntentBits,
  type Message,
  type GuildChannelManager,
  type TextChannel,
  type Channel,
} from "discord.js";
import { Result } from "aeria";

const discord = {
  client: new Client({
    intents: [GatewayIntentBits.Guilds],
  }),
  mainServerManager: {} as GuildChannelManager,
};

const checkClient = async () => {
  if (!discord.client.token) {
    await discord.client.login(process.env.DISCORD_BOT_TOKEN);
  }

  if (!discord.mainServerManager.client) {
    const server = await discord.client.guilds.fetch(
      process.env.DISCORD_MAIN_SERVER_ID
    );
    discord.mainServerManager = server.channels;
  }

  return new Promise<void>((resolve) => {
    if (discord.client.isReady()) {
      resolve();
    }
    discord.client.once("ready", () => {
      resolve();
    });
  });
};

type SendMessageParameters = {
  channelId: string;
  message: Parameters<typeof TextChannel.prototype.send>[0];
  notFromMainServer?: boolean;
};

const sendMessage = async (
  params: SendMessageParameters
): Promise<
  Result.Error<DiscordAPIError> | Result.Result<Message<true> | any>
> => {
  await checkClient();

  try {
    let channel: Channel | null;

    if (params.notFromMainServer) {
      channel = await discord.client.channels.fetch(params.channelId);
    } else {
      channel = await discord.mainServerManager.fetch(params.channelId);
    }

    if (channel?.isTextBased() && channel.isSendable()) {
      const message = await channel.send(params.message);
      return Result.result(message);
    }

    return Result.result({
      message: "Not an text based channel, ignoring.",
    });
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      return Result.error(error);
    }
    throw error;
  }
};

export const discordAPI = {
  sendMessage,
};
