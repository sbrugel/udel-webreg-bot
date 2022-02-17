import DiscordJS, { Intents, MessageEmbed, TextChannel } from 'discord.js'
import WOKCommands from 'wokcommands'
import path from 'path'
import 'dotenv/config'

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.login(process.env.TOKEN)

client.on('ready', async () => {
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        typeScript: true,
        testServers: ['679777315814637683', '942491918867259472'],
        botOwners: []
    })
    console.log('Ready!');
})
