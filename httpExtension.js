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
    you.haya(song);
    res.send("ok");
});

module.exports = {
    setbam(haha) {
        you = haha;
    }
}



