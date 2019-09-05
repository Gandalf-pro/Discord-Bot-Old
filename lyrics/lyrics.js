const fetch = require("node-fetch");
const path = require('path');
const config = require(path.join(__dirname, "../config.json"));
const ip = config.lyricServer;
const port = "8416";
console.log(`Using ${ip}:${port} for Lyric server`);
const apiKey = config.lyricApiKey;
const chLimit = 2000;

module.exports = {
    async getData(songName) {
        console.log(songName);

        let url = "http://" + ip + ":" + port + "/api/" + songName;
        url += "?key=\"" + apiKey + "\"";

        // let url = "http://localhost:4000/api/" + songName;
        let lyrics = await fetch(url);
        lyrics = await lyrics.text();

        return lyrics;
    },
    async getLyrics(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        //if there is a song playing
        if (serverQueue && serverQueue.songs.length > 0) {
            let lyrics = await this.getData(serverQueue.songs[0].title);
            return lyrics;
        }
    },
    async sendLyrics(message, song) {
        let lyrics;
        if (song) {
            lyrics = await this.getData(song);
        } else {
            lyrics = await this.getLyrics(message);
        }
        let count = Math.ceil(lyrics.length / chLimit);
        for (let i = 0; i < count; i++) {
            if (lyrics.length > ((i + 1) * chLimit)) {
                message.channel.send(lyrics.slice(i * chLimit, ((i + 1) * chLimit)));
            } else {
                message.channel.send(lyrics.slice(i * chLimit));
            }
        }
    },
    async sendToTextChannel(textChannel, song) {
        let lyrics = await this.getData(song);

        let count = Math.ceil(lyrics.length / chLimit);
        for (let i = 0; i < count; i++) {
            if (lyrics.length > ((i + 1) * chLimit)) {
                textChannel.send(lyrics.slice(i * chLimit, ((i + 1) * chLimit)));
            } else {
                textChannel.send(lyrics.slice(i * chLimit));
            }
        }
    }
}