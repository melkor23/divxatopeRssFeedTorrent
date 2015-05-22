var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var xml2jsParser = require('xml2js');
var request = require('request');

var app = express();
var port = 8000;


/*
    variables
*/
var urlFeed = 'http://www.divxatope.com/feeds.xml';
var filterParameters = {
    contains: [],
    ignore: []
};
var defaultParameters = {
    contains: '+',
    ignore: '--'
};
var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
};

// Configure the request
var options = {
    url: urlFeed,
    method: 'GET',
    headers: headers
};




function sacaItems(items) {
    var i;
    for (i in items) {


        // Configure the request
        options.url = urlFeed;
        items[i].link[0];

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var posIni = body.indexOf("http://www.divxatope.com/descarga-torrent/");
                //console.log("posIni" + posIni);
                var posFin = body.indexOf('"', body.indexOf("http://www.divxatope.com/descarga-torrent/"));
                //console.log("posFin" + posFin);

                var link = body.substr(posIni, posFin - posIni);
                console.log(link);
            }
        });
    }
}







app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/rss/:parameters', function (req, res) {

    // Configure the request
    options.url = urlFeed;

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Print out the response body
            //console.log(body);
            var parser = new xml2jsParser.Parser();
            var xmlObject=null;
            parser.parseString(body, function (err, result) {
                //console.log(body);
                xmlObject = result;
                sacaItems(result.rss.channel[0].item);
            });
        }
    })
});







//quitamos acentos
function removeAccents(str) {
    return str
        .replace(/[áàãâä]/gi, "a")
        .replace(/[éè¨ê]/gi, "e")
        .replace(/[íìïî]/gi, "i")
        .replace(/[óòöôõ]/gi, "o")
        .replace(/[úùüû]/gi, "u");
}


//default response
app.get('*', function (req, res) {
    res.send('<html><h1>No hay ninguna pagina en la ruta!!</h1></html>')
});


app.listen(port);
console.log("SERVER UP on port:" + port)
