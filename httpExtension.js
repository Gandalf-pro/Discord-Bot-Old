const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var you;

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


//express server
app.listen(1234, () => {
    console.log('Server Works !!! At port 1234');
});

//["play", "skip", "rainbow", "pause", "resume", "lyrics", "volume"]

app.get('/play*', (req, res) => {
    let song = req.query.args;
    let name = req.query.username;
    you._play(name, song);
    res.send("ok");
});

app.get('/skip*', (req, res) => {
    let name = req.query.username;
    you._skip(name);
    res.send("ok");
});

app.get('/pause*', (req, res) => {
    let name = req.query.username;
    you._pause(name);
    res.send("ok");
});

app.get('/resume*', (req, res) => {
    let name = req.query.username;
    you._resume(name);
    res.send("ok");
});

app.get('/lyric*', (req, res) => {
    let name = req.query.username;
    let songName = req.query.args;
    if (songName.length > 2) {
        you._lyrics(name, songName);
        console.log(`Lyrics:${songName}`);
    } else {
        you._lyrics(name);
    }
    res.send("ok");
});



app.get('/volume*', (req, res) => {
    let name = req.query.username;
    let level = req.query.args;
    if (!level) {
        res.send("You have to send a level");
        return;
    }
    level = parseFloat(level)
    you._volume(name, level);
    res.send("ok");
});

module.exports = {
    setbam(haha) {
        you = haha;
    }
}