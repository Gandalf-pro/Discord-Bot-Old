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


app.get('/play/:song', (req, res) => {
    let song = req.params.song;
    let name = req.query.username;
    // you._skip(name);
    // you.haya(song);
    you._play(name, song);
    res.send("ok");
});

app.get('/skip', (req, res) => {
    let name = req.query.username;
    you._skip(name);
    res.send("ok");
});

module.exports = {
    setbam(haha) {
        you = haha;
    }
}



