const fs = require("fs");
const path = require('path');
var userFile = fs.readFileSync(path.join(__dirname, 'usernames.json'));
var usernames = JSON.parse(userFile);
const fetch = require("node-fetch");
const Discord = require("discord.js");

function getImgUrl(id) {
    return ("https://ubisoft-avatars.akamaized.net/" + id + "/default_256_256.png");
}

module.exports = {
    async getData(user) {
        let url = "https://r6tab.com/api/search.php?platform=uplay&search=" + user;
        let info = await fetch(url);
        let jsonData = await info.json();
        let data = {
            "username": jsonData.results[0].p_name,
            "level": jsonData.results[0].p_level,
            "mmr": jsonData.results[0].p_currentmmr,
            "kd": (jsonData.results[0].kd / 100),
            "rank": jsonData.results[0].p_currentrank,
            "id": jsonData.results[0].p_id,
            "imgUrl": getImgUrl(jsonData.results[0].p_id)
        }
        return data;
    },
    async getAllTheUserData() {
        let ret = [];
        for (let i = 0; i < usernames.usernames.length; i++) {
            ret.push(await this.getData(usernames.usernames[i]));
        }
        return ret;
    },
    async sendEmbed(message, user) {
        let data = await this.getData(user);
        const emb = new Discord.RichEmbed().setTitle(data.username)
            .setThumbnail(data.imgUrl).setURL("https://r6.tracker.network/profile/pc/" + data.username)
            .addField("LEVEL", data.level)
            .addField("MMR", data.mmr).addField("KD", data.kd);
        message.channel.send(emb);
    },
    async sendAllEmbed(message) {
        for (let i = 0; i < usernames.usernames.length; i++) {
            this.sendEmbed(message, usernames.usernames[i]);
        }
    },
    reload() {
        userFile = fs.readFileSync(path.join(__dirname, 'usernames.json'));
        usernames = JSON.parse(userFile);
    }
}