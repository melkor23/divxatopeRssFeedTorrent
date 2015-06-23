/*required*/
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var xml2jsParser = require('xml2js');
var request = require('request');
var fs = require("fs");
var rss = require("rss");
var unirest = require('unirest');
var sequence = require('sequence');
var http = require('http');
var md5 = require('MD5');
var passport = require('passport');

//users
var cookieParser = require('cookie-parser');
var session = require('express-session');


var app = express();
var port = 8000;

app.use(cookieParser('contrasenya2015'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'contrasenya2015',
    resave: true,
    saveUninitialized: true
}));

app.use(function (req, res, next) {
    if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;
    }

    res.locals.session = req.session;
    next();
})

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('css', __dirname + '/public/stylesheets');
app.use(express.static(path.join(__dirname, 'public')));





//imports
var rssfeed = require('./routes/feed');
var routes = require('./routes/index');
var sessionController = require('./controllers/session_controller');
var showListController = require('./controllers/showsController');
var util = require('./controllers/util');


app.get('/feedAll', rssfeed.rssfeedAll);
app.get('/feed', rssfeed.rssfeed);
app.get('/jsonview', rssfeed.rssjson);
app.get('/auth', function (req, res, next) {
    //res.sendfile('views/login.html');
    res.render('login', {
        title: 'Melkor Rss Feed'
    });
});



/* GET home page. */
app.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});


app.get('/login', sessionController.new);
app.post('/login', sessionController.create);
app.get('/logout', sessionController.destroy);
app.get('/additem', showListController.additem);

app.post('/AddTorrent', function (req, res, next) {
    if (req.session.user != null) {

        console.log('AddTorrent OK' + req.body);
        var jsonObject = JSON.parse(req.body)
        console.log('AddTorrent OK' + jsonObject);
        console.log('AddTorrent OK' + jsonObject.itemStr);
    } else {
        //error
    }

});


app.get('/rss/', function (req, res) {
    res.send(feedAct.xml());
});

app.get('/rss2/', function (req, res) {
    res.send(feedAct);
});


app.get('/json', function (req, res) {

    var filtros = JSON.parse(fs.readFileSync('./filtros.json', 'utf8'));
    res.send(filtros);
})
app.post('/json', function (req, res) {
    if (req.session.user != null) {
        console.log('Salvamos json filtros');
        console.log('POST ---->\n' + JSON.stringify(req.body));

        fs.writeFile('./filtros.json', JSON.stringify(req.body), 'utf8', function () {
            res.sendStatus(200);
        })
    } else {
        res.sendStatus(401);
    }

    /*
        var filtros = JSON.parse(fs.readFileSync('./filtros.json', 'utf8'));
            res.send(filtros);*/
})



app.get('/rssAll/', function (req, res) {
    var auxArray = [];
    unirest.get('http://www.divxatope.com/feeds.xml').end(function (response) {
        if (response.statusCode === 200) {
            //                        console.log(response.body);
            var parser = new xml2jsParser.Parser();
            var xmlObject = null;
            parser.parseString(response.body, function (err, result) {
                //console.log(result.rss.channel[0].item);
                auxArray = result.rss.channel[0].item;
                res.send(result.rss.channel[0].item)
            });

        }
    });
});



// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}



// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



var user = {
    username: '',
    password: ''
}



/*
    variables
*/
var feedAct = new rss({
    title: 'Feed RSS',
    description: 'Feed local para divxatope',
    feed_url: 'http://example.com/rss.xml',
    site_url: 'http://example.com',
    image_url: 'http://example.com/icon.png',
    docs: 'http://example.com/rss/docs.html',
    managingEditor: 'Eduardo Alvir',
    webMaster: 'Eduardo Alvir',
    copyright: 'Eduardo Alvir',
    language: 'es',
    //categories: ['Category 1', 'Category 2', 'Category 3'],
    pubDate: 'May 25, 2015 04:00:00 GMT',
    ttl: '60',
    custom_namespaces: {}
});

var urlFeed = 'http://www.divxatope.com/feeds.xml';
var urlDownloadIni = 'http://www.divxatope.com/descarga-torrent/';
var urlDownloadFin = 'http://www.divxatope.com/torrent/';

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


function itemSeleccionado(str, filtros) {
    var ff,
        strCont,
        strIg,
        boolContains,
        boolIgnore;

    var filtroCumplido = true;
    for (var i = 0; i < filtros.length; i++) {
        boolContains = true;
        boolIgnore = true;


        for (var j = 0; j < filtros[i].containsStr.length; j++) {
            if (str[0].indexOf(filtros[i].containsStr[j]) >= 0 &&
                (str[0].indexOf(filtros[i].quality) >= 0 || filtros[i].quality == '' || filtros[i].quality == null)) {
                boolContains ? true : false;
            } else {
                boolContains = false;
            }
        }

        //si lo hemos encontrado
        if (boolContains) {
            return true;
        } else {


            filtroCumplido = false;

        }
    }
    return filtroCumplido;
}




var Allitems = '';

function recargaFeed() {
    console.log('-----------------RECARGA ' + new Date() + '---------------------');
    var iniTime = new Date();

    feedAct = new rss({
        title: 'Feed RSS',
        description: 'Feed local para divxatope',
        feed_url: 'http://example.com/rss.xml',
        site_url: 'http://example.com',
        image_url: 'http://example.com/icon.png',
        docs: 'http://example.com/rss/docs.html',
        managingEditor: 'Eduardo Alvir',
        webMaster: 'Eduardo Alvir',
        copyright: 'Eduardo Alvir',
        language: 'es',
        //categories: ['Category 1', 'Category 2', 'Category 3'],
        pubDate: 'May 25, 2015 04:00:00 GMT',
        ttl: '60',
        custom_namespaces: {}
    });

    unirest.get('http://www.divxatope.com/feeds.xml').end(function (response) {
        if (response.statusCode === 200) {
            var parser = new xml2jsParser.Parser();
            var xmlObject = null;
            parser.parseString(response.body, function (err, result) {
                xmlObject = result;
                //global variable
                Allitems = result;
                sacaItems(result.rss.channel[0].item);
            });
        }
    });

    var finTime = new Date();
    var diff = finTime.getTime() - iniTime.getTime();
    console.log('Time elapsed:' + diff);
}




function sacaItems(items) {
    var filtros = JSON.parse(fs.readFileSync('./filtros.json', 'utf8')),
        i,
        cont = 0;

    var Promise = require('es6-promise').Promise,
        state = {};

    for (i in items) {
        options.url = items[i].link[0];
        //miramos si lo tenemos que sacar
        var auxI = i;
        if (itemSeleccionado(items[i].title, filtros)) {
            //console.log('A->' + items[i].link[0] + 'i->' + i);
            new Promise(function (resolve, reject) {
                resolve(i);
            }).then(function (a) {
                state.a = a;
                //console.log("A en la funcion: " + a);
                unirest.get(items[a].link[0]).end(function (response) {
                    //console.log('B->' + items[a].link[0] + 'a->' + a);
                    if (response.statusCode === 200) {
                        try {
                            var posIni = response.body.indexOf(urlDownloadIni),
                                posFin = response.body.indexOf('"', response.body.indexOf(urlDownloadIni)),
                                link = response.body.substr(posIni, posFin - posIni).replace(urlDownloadIni, urlDownloadFin);

                            var aux = items[a].description[0].substring(items[a].description[0].indexOf('src="'));

                            //console.log('title->' + items[a].title);
                            //console.log('description->' + items[a].description[0].substring(items[a].description[0].indexOf('src="') + ('strc=').length, aux.indexOf('"', 5) + ('strc=').length));
                            //console.log('link->' + link);
                            //console.log('guid->'+items[a].title[0].match(/\[Cap*\.[0-9]*\]/));
                            //console.log('guid->'+!items[a].title[0].match(/\[Cap*\.[0-9]*\]/)?'true':'false');

                            var strGuid = '';
                            try {
                                strGuid = items[a].title[0].match(/\[Cap*\.[0-9]*\]/)[0];
                            } catch (Exception) {
                                strGuid = util.shortName(items[a].title[0]);
                            }


                            feedAct.item({
                                title: items[a].title,
                                description: items[a].description[0].substring(items[a].description[0].indexOf('src="') + ('strc=').length, aux.indexOf('"', 5) + ('strc=').length),
                                url: link, // link to the item
                                guid: strGuid, // optional - defaults to url
                                //categories: ['Category 1', 'Category 2', 'Category 3', 'Category 4'], // optional - array of item categories
                                author: 'Eduardo Alvir', // optional - defaults to feed author property
                                date: new Date(items[a].pubDate[0]) //'May 25, 2012', // any format that js Date can parse.
                                    //lat: 33.417974, //optional latitude field for GeoRSS
                                    //long: -111.933231, //optional longitude field for GeoRSS,
                            });
                        } catch (err) {
                            console.log("No se ha podido leer el cuerpo de la pagina" + err.message);
                        }
                        cont++;
                        if (items.length == cont) {}
                    }
                });
                resolve('b');
            });
        }
    }
}



function containsStr(str, strKey) {
    if (srt == null || strKey == null) {
        return false;
    } else if (str.toLowerCase().indexOf(strKey) >= 0) {
        return true;
    } else {
        return false;
    }
}

function NotcontainsStr(str, strKey) {
    return !containsStr(str, strKey);
}


function getContainFilter(url) {
    filterParameters.contains = str.split(defaultParameters.contains);
}

function functiongetNOTcontainFilter(url) {
    filterParameters.contains = str.split(defaultParameters.ignore);
}



//default response
app.get('*', function (req, res) {
    res.send('<html><h1>No hay ninguna pagina en la ruta!!</h1></html>');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

recargaFeed();
setInterval(function () {
    console.log('---------------------------------------');
    recargaFeed();
}, 60 * 1000);


module.exports = app;
