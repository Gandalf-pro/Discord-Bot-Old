console.clear();
const path = require("path")
const Discord = require('discord.js');
const Client = require(path.join(__dirname, 'client/Client'));
const config = require(path.join(__dirname, "config.json"));
const fs = require('fs');
const bot = new Client(config.token);



const you = require(path.join(__dirname, 'youtube/youtube'));
const rainbow = require(path.join(__dirname, 'R6/rainbow'));
const lyrics = require(path.join(__dirname, 'lyrics/lyrics'));
var commands = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands.json')));
var responses = JSON.parse(fs.readFileSync(path.join(__dirname, 'responses.json')));

var htp = require(path.join(__dirname, 'httpExtension'));


bot.login(config.token);

bot.on('ready', async () => {
    console.log('Connected to the server');
    // console.log(await bot.users.get("140235371740004353"));
    // getVoiceChannelOfUser("140235371740004353");
    // console.log(getIdOfUser("Gandalf-pro"));
});

//bot queue is set for guild(server) id
//but bot goes to voice channels
//meaning there can only be one bot on the server









//give a random response
function randomRes(param) {
    return param[Math.floor(Math.random() * param.length)];
}


function reload() {
    commands = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands.json')));
    responses = JSON.parse(fs.readFileSync(path.join(__dirname, 'responses.json')));
}


bot.on('message', async msg => {
    //if its starts with the prefix
    if (msg.content.startsWith(config.prefix)) {
        msg.delete(3 * 60 * 1000);
        let mesage = msg.content.slice(config.prefix.length);
        let args = mesage.split(" ");


        if (mesage === 'west side') {
            msg.reply('yeah ni');
        }



        //play command
        commands.play.forEach(element => {
            if (element === args[0] || element === mesage) {
                you.execute(msg);
                return;
            }
        });

        //leave command
        commands.leave.forEach(element => {
            if (element === args[0] || element === mesage) {
                msg.reply(randomRes(responses.leave));
                you.stop(msg);
                return;
            }
        });

        //pause command
        commands.pause.forEach(element => {
            if (element === args[0] || element === mesage) {
                you.pause(msg);
                return;
            }
        });

        //resume command
        commands.resume.forEach(element => {
            if (element === args[0] || element === mesage) {
                you.resume(msg);
                return;
            }
        });

        //skip command
        commands.skip.forEach(element => {
            if (element === args[0] || element === mesage) {
                you.skip(msg);
                return;
            }
        });

        //queue
        commands.queue.forEach(element => {
            if (element === args[0] || element === mesage) {
                you.queue(msg);
                return;
            }
        });

        //nowPlaying
        commands.nowPlaying.forEach(element => {
            if (element === args[0] || element === mesage) {
                you.nowPlaying(msg);
                return;
            }
        });

        //rainbow
        commands.rainbow.forEach(async element => {
            if (element === args[0] || element === mesage) {
                // let data = await rainbow.getData(args[1]);
                // let res = data.username + " is level " + data.level + " with " + data.kd + " kd and " + data.mmr + " mmr";
                // msg.channel.send(res);
                //it has a name

                if (args.length > 1 && args[1].toLowerCase() !== "all") {
                    rainbow.sendEmbed(msg, args[1]);
                } else {
                    rainbow.sendAllEmbed(msg);
                }
            }
        });



        //lyrics
        commands.lyrics.forEach(async element => {
            if (element === args[0] || element === mesage) {
                //if it has a song name in it
                if (args.length > 1) {
                    lyrics.sendLyrics(msg, mesage.slice(element.length + 1));
                } else {
                    lyrics.sendLyrics(msg);
                }



            }
        });

        //reload
        commands.reload.forEach(element => {
            if (element === args[0] || element === mesage) {
                console.log("reloading");
                rainbow.reload();
                reload();
            }
        });

        //volume
        commands.volume.forEach(element => {
            if (element === args[0] || element === mesage) {
                you.volume(msg);
            }
        });



    }
});


bot.on('guildMemberAdd', async member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(randomRes(responses.welcome) + member);
});

htp.setbam(you);
you.setBot(bot);