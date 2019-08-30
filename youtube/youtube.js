const fs = require('fs');
const Youtube = require('simple-youtube-api');
const config = require('../config.json');
const youtube = new Youtube(config.youtubeAPI);
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const lyrics = require('../lyrics/lyrics');

var bot; //bot = to message.client




async function searchVideo(name, username) {
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
        thum: thum.url,
        requestedBy: username
    }
    return song;
}

async function sendAddedToQueueEmbed(textChannel, song) {
    textChannel.send(`${song} has been added to the queue!`);
}

async function sendNowPlayingEmbed(textChannel, song) {
    const rich = new Discord.RichEmbed()
        .setColor('#553778')
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor("Now Playing")
        .setThumbnail(song.thum)
        .addField("DJ:", song.requestedBy, false);
    textChannel.send(rich);
}

async function getSongFromUrl(url, username) {
    const songInfo = await ytdl.getInfo(url);
    song = {
        "title": songInfo.player_response.videoDetails.title,
        "url": url,
        "thum": songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
        "requestedBy": username
    }
    return song;
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
    async execute(message, gotSong, channel) {
        messa = message;
        const args = message.content.split(' ');
        const queue = message.client.queue;
        const serverQueue = message.client.queue.get(message.guild.id);

        //voice channel checking
        const voiceChannel = message.member.voiceChannel;
        console.log(voiceChannel);
        if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');

        //permission checking
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.channel.send('I need the permissions to join and speak in your voice channel!');
        }

        let empty = false;
        let song;


        //if empty meaning just caling to bot to voice channel       
        if (args.length <= 1 && !serverQueue) {
            console.log("hello");
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: false
            };

            queue.set(message.guild.id, queueContruct);


            queueContruct.connection = await voiceChannel.join();

            return;
        } else if (ytdl.validateURL(args[1])) {
            //if we got a youtube url
            song = getSongFromUrl(args[1], message.author);
        } else if (message.content.slice(args[0].length + 1).length > 1) {
            //search the video and then put in a object
            song = await searchVideo((message.content.slice(args[0].length + 1)), message.author).catch(error => {
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
            if (!serverQueue.playing) {
                this.play(message, song)
            } else {
                return sendAddedToQueueEmbed(message.channel, song.title);
            }
        }

    },
    play(message, song, chan) {
        const queue = bot.queue;
        let guild;
        //if there is a channel id instead of a message (for speech)
        if (chan) {
            guild = chan;
        } else {
            guild = message.guild.id;
        }
        const serverQueue = queue.get(guild);


        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild);
            return;
        }


        sendNowPlayingEmbed(serverQueue.textChannel, song);

        serverQueue.playing = true;
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url, {
                filter: "audioonly"
            }), {
                volume: 0.5,
                passes: 5
            })
            .on('end', () => {
                console.log('Music ended!');
                serverQueue.songs.shift();
                if (message) {
                    this.play(message, serverQueue.songs[0]);
                } else {
                    this.play(false, serverQueue.songs[0], chan);
                }
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
    skip(message) {
        var serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
        if (!serverQueue) return message.channel.send('There is no song that I could skip!');
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
    _skip,
    _play,
    _pause,
    _resume,
    _lyrics,
    _volume
}


//voice req stuff
async function _skip(name) {
    let channels = await getVoiceChannelOfUser(getIdOfUser(name));
    let channelId = channels.guild;
    let serverQueue = bot.queue.get(channelId);
    serverQueue.connection.dispatcher.end();
}

async function _pause(name) {
    let channels = await getVoiceChannelOfUser(getIdOfUser(name));
    let channelId = channels.guild;
    let serverQueue = bot.queue.get(channelId);
    serverQueue.connection.dispatcher.pause();
}

async function _resume(name) {
    let channels = await getVoiceChannelOfUser(getIdOfUser(name));
    let channelId = channels.guild;
    let serverQueue = bot.queue.get(channelId);
    serverQueue.connection.dispatcher.resume();
}

async function _lyrics(name, songName) {
    let channels = await getVoiceChannelOfUser(getIdOfUser(name));
    let channelId = channels.guild;
    let serverQueue = bot.queue.get(channelId);
    var reelSongName;
    //if a song name is provided
    if (songName) {
        reelSongName = songName;
    } else if (serverQueue.playing) { //if we already got one playing
        reelSongName = serverQueue.songs[0].title;
    } else {
        console.log("cant get the lyrics");
        return;
    }
    await lyrics.sendToTextChannel(serverQueue.textChannel, reelSongName);
}

async function _volume(name, level) {
    let channels = await getVoiceChannelOfUser(getIdOfUser(name));
    let channelId = channels.guild;
    let serverQueue = bot.queue.get(channelId);
    serverQueue.connection.dispatcher.setVolume(level);
}

async function _play(name, songGot) {
    let channels = await getVoiceChannelOfUser(getIdOfUser(name));
    let voiceChannel = channels.voice;
    let textChannel = channels.text;
    let channel = channels.guild;
    let queue = bot.queue;
    if (channel) {
        let serverQueue = bot.queue.get(channel);
        //searching the song from youtube
        let song = await searchVideo(songGot, name);

        //if bot is already in the server
        if (serverQueue) {

            //pushing the song to servers queue
            serverQueue.songs.push(song);

            if (!serverQueue.playing) { //if nothing is playing play the song
                module.exports.play(false, song, channel);
            } else { //else only add it to the queue
                sendAddedToQueueEmbed(serverQueue.textChannel, song.title)
            }



        } else { //if bot is not in the server
            //blueprint for serverQueue
            const queueContruct = {
                "textChannel": textChannel,
                "voiceChannel": voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            //puting the blueprint to the general(bot's) db
            queue.set(channel, queueContruct);
            queueContruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();

                queueContruct.connection = connection;
                module.exports.play(false, song, channel);
            } catch (error) {
                console.log(error);
                queue.delete(channel);
                return queueContruct.textChannel.send(error);
            }

        }

    } else {
        console.log("you have to be in a server username:" + name);
    }
}

function getIdOfUser(name) {
    let users = bot.users.array();
    let user = users.find((val, i, obj) => val.username == name);
    return user.id;
}

//returns the guild(server) id
async function getVoiceChannelOfUser(id) {
    let chs = bot.channels;
    let bam = chs.array();


    for (const element of bam) {
        if (element.type == 'voice') {
            let chan = element.members.get(id);
            if (chan) {
                let voiceId = element;
                let guildId = chan.guild.id;
                let textId = bot.channels.get(chan.guild.systemChannelID);
                return {
                    "voice": voiceId,
                    "guild": guildId,
                    "text": textId
                };
            }
        }
    }
}