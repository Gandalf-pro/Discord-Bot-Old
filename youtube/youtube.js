const fs = require('fs');
const Youtube = require('simple-youtube-api');
const config = require('../config.json');
const youtube = new Youtube(config.youtubeAPI);
const ytdl = require('ytdl-core');
const Discord = require('discord.js');

var bot;




async function searchVideo(name) {
    let videos = await youtube.searchVideos(name, 1);
    let thumbs = videos[0].thumbnails;
    let thum;
    if (thumbs.maxres) {
        // console.log("max");
        thum = thumbs.maxres;
    } else if (thumbs.high) {
        // console.log("0");
        thum = thumbs.high;
    } else if (thumbs.medium) {
        // console.log("1");
        thum = thumbs.medium;
    } else if (thumbs.default) {
        // console.log("2");
        thum = thumbs.default;
    } else if (thumbs.standard) {
        // console.log("3");
        thum = thumbs.standard;
    }
    let song = {
        title: videos[0].title,
        url: videos[0].url,
        thum: thum.url
    }
    return song;
}

async function sendNowPlayingEmbed(message, song) {
    const rich = new Discord.RichEmbed()
        .setColor('#553778')
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor("Now Playing")
        .setThumbnail(song.thum)
        .addField("DJ:", message.author, false);
    message.channel.send(rich);
}

module.exports = {
    async haya(name) {
        this.execute(messa, name);
    },
    async gaga(name) {
        let url;
        if (ytdl.validateURL(name)) {
            url = name;
        } else {
            let videos = await youtube.searchVideos(name, 1);
            url = 'http://www.youtube.com/watch?v=' + videos[0].raw.id.videoId;
        }
        return ytdl(url, {
            filter: "audioonly"
        });
    },
    async execute(message, gotSong) {
        messa = message;
        const args = message.content.split(' ');
        const queue = message.client.queue;
        const serverQueue = message.client.queue.get(message.guild.id);

        //voice channel checking
        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');

        //permission checking
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.channel.send('I need the permissions to join and speak in your voice channel!');
        }

        let empty = false;
        let song;
        //adding a url
        // console.log(args[1]);
        // console.log(ytdl.validateURL(args[1]));
        // console.log(message.content.slice(args[0].length + 1).length > 1);
        // console.log(message.content.slice(args[0].length + 1));

        //if empty           
        if (args.length <= 1) {
            console.log("hello");
            voiceChannel.join();
            return;
        } else if (ytdl.validateURL(args[1])) {
            const songInfo = await ytdl.getInfo(args[1]);

            song = {
                title: songInfo.player_response.videoDetails.title,
                url: args[1],
                thum: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url
            }
        } else if (gotSong) {
            song = await searchVideo(gotSong).catch(error => {
                console.log(error);
            });
        } else if (message.content.slice(args[0].length + 1).length > 1) {
            //search the video and then put in a object
            song = await searchVideo((message.content.slice(args[0].length + 1))).catch(error => {
                console.log(error);
            });
        } else {
            empty = true;
        }


        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };

            queue.set(message.guild.id, queueContruct);

            if (!empty) {
                queueContruct.songs.push(song);
            }

            try {
                var connection = await voiceChannel.join();

                queueContruct.connection = connection;
                if (!empty) {
                    this.play(message, queueContruct.songs[0]);
                }
            } catch (error) {
                console.log(error);
                queue.delete(message.guild.id);
                return message.channel.send(error);
            }


        } else {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} has been added to the queue!`);
        }

    },
    play(message, song) {
        const queue = message.client.queue;
        const guild = message.guild;
        const serverQueue = queue.get(message.guild.id);

        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        // message.channel.send(`Now Playing:${song.title}    DJ:${message.author}`);
        sendNowPlayingEmbed(message, song);
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url, {
                filter: "audioonly"
            }), {
                volume: 0.5,
                passes: 5
            })
            .on('end', () => {
                console.log('Music ended!');
                serverQueue.songs.shift();
                this.play(message, serverQueue.songs[0]);
            })
            .on('error', error => {
                console.log(error);
            });
        // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    },
    stop(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    },
    skip(message, serverId) {
        var serverQueue;
        if (!serverId) {
            serverQueue = message.client.queue.get(message.guild.id);
            if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
            if (!serverQueue) return message.channel.send('There is no song that I could skip!');
        } else {
            serverQueue = bot.queue.get(serverId);
        }
        serverQueue.connection.dispatcher.end();
    },
    pause(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
        if (serverQueue.connection.dispatcher.paused) return message.channel.send('Music is already paused');
        serverQueue.connection.dispatcher.pause();
    },
    resume(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
        if (!serverQueue.connection.dispatcher.paused) return message.channel.send('Music is already playing');
        serverQueue.connection.dispatcher.resume();
    },
    nowPlaying(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        return message.channel.send(`Now playing: ${serverQueue.songs[0].title}`);
    },
    queue(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        let text = "";
        serverQueue.songs.forEach((element, i) => {
            text += (i + 1) + "." + element.title + "\n";
        });
        return message.channel.send(text);
    },
    volume(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to change the volume!');
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        let level = parseFloat(message.content.split(" ")[1]);
        if (!level) return message.channel.send('Enter a number eg.(0.5)');
        serverQueue.connection.dispatcher.setVolume(level);
    },
    setBot(gotBot) {
        bot = gotBot;
    },
    _skip
}


//voice req stuff
async function _skip(name) {
    let channel = await getVoiceChannelOfUser(getIdOfUser(name));
    module.exports.skip(null, channel);
}

function getIdOfUser(name) {
    let users = bot.users.array();
    let user = users.find((val, i, obj) => val.username == name);
    return user.id;
}


async function getVoiceChannelOfUser(id) {
    let chs = bot.channels;
    let bam = chs.array();


    for (const element of bam) {
        if (element.type == 'voice') {
            let chan = element.members.get(id);
            if (chan) {
                return chan.guild.id;
            }
        }
    }
    // for (let i = 0; i < bam.length; i++) {
    //     const element = bam[i];

    // }
    // console.log(bam);
    // let haya = new Map();
    // haya.get("id")
}



// youtube.searchVideos("payphone", 1).then(videos => {
//     console.log(videos);

//     console.log(videos[0].raw.id.videoId);
//     let url = 'http://www.youtube.com/watch?v=' + videos[0].raw.id.videoId;
//     // ytdl(url, { filter: "audioonly" }).pipe(fs.createWriteStream('bam.flv'));
// })