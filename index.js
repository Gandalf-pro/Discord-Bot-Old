const Discord = require('discord.js');
const Client = require('./client/Client');
const config = require("./config.json");
const fs = require('fs');
const bot = new Client(config.token);



const you = require('./youtube/youtube');
const rainbow = require('./R6/rainbow');
const lyrics = require('./lyrics/lyrics');
var commands = JSON.parse(fs.readFileSync('./commands.json'));
var responses = JSON.parse(fs.readFileSync('./responses.json'));

var htp = require('./httpExtension');


bot.login(config.token);

bot.on('ready', async () => {
    console.log('Connected to the server');
    // console.log(await bot.users.get("140235371740004353"));
    getVoiceChannelOfUser("140235371740004353");
    console.log(getIdOfUser("Gandalf-pro"));
});



function getIdOfUser(name) {
    let users = bot.users.array();
    let user = users.find((val, i, obj) => val.username == name);
    return user.id;
}


async function getVoiceChannelOfUser(id) {
    let chs = await bot.channels;
    let bam = chs.array();

    for (const element of bam) {
        let chan = element.members.get(id);
        if (chan) {
            return chan;
        }
    }
    // for (let i = 0; i < bam.length; i++) {
    //     const element = bam[i];

    // }
    // console.log(bam);
    // let haya = new Map();
    // haya.get("id")
}







//give a random response
function randomRes(param) {
    return param[Math.floor(Math.random() * param.length)];
}


function reload() {
    commands = JSON.parse(fs.readFileSync('./commands.json'));
    responses = JSON.parse(fs.readFileSync('./responses.json'));
}


bot.on('message', async msg => {
    //if its starts with the prefix
    if (msg.content.startsWith(config.prefix)) {
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