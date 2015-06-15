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

app.use(cookieParser('Quiz 2015'));
app.use(session({
    secret: 'Quiz 2015',
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





app.use(bodyParser.urlencoded({
    extended: true
}));


var rssfeed = require('./routes/feed');
app.get('/feed', rssfeed.rssfeed);

var rssfeed = require('./routes/feed');
app.get('/feedAll', rssfeed.rssfeedAll);

//users
var routes = require('./routes/index');
//var users = require('./routes/users');



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



app.get('/auth', function (req, res, next) {
    //res.sendfile('views/login.html');
    res.render('login', {
        title: 'Melkor Rss Feed'
    });
});

var sessionController = require('./controllers/session_controller');
var showListController=require('./controllers/showsController');

/* GET home page. */
app.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});


app.get('/login', sessionController.new);
app.post('/login', sessionController.create);
app.get('/logout', sessionController.destroy);


app.get('/additem',showListController.additem);


app.get('/loginFailure', function (req, res, next) {
    res.send('Failure to authenticate');
});

app.get('/loginSuccess', function (req, res, next) {
    res.send('Successfully authenticated');
});

app.get('/logged', function (req, res, next) {
    res.send(isLoggedIn(req, res, next));

});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    console.log('autheticate?' + req.user.authenticated);
    if (req.user.authenticated)
        return true;
    else
        return false;
}


app.post('/AddTorrent', function (req, res, next) {
     if (req.session.user != null) {

      console.log('AddTorrent OK'+ req.body)   ;
         var jsonObject = JSON.parse(req.body)
         console.log('AddTorrent OK'+ jsonObject)   ;
         console.log('AddTorrent OK'+ jsonObject.itemStr)   ;
     }
    else{
        //error
    }

});

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

    //console.log(str);
    var filtroCumplido = true;
    for (var i = 0; i < filtros.length; i++) {
        boolContains = true;
        boolIgnore = true;

        for (var j = 0; j < filtros[i].containsStr.length; j++) {
            //console.log(str[0].indexOf(filtros[i].containsStr[j]) === -1);
            //console.log(" str:" + str + " filter:" + filtros[i].containsStr[j]);
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
                            //console.log('1substring->' + aux);
                            //console.log('POSICION->'+aux.indexOf('"',5));
                            //console.log(items[i-1].description[0].substring(items[i-1].description[0].indexOf('src="')+('strc=').length,aux.indexOf('"',5)+('strc=').length));
                            //console.log("item:" + items[a]);
                            //console.log("DEscription:" + items[a].description);
                            feedAct.item({
                                title: items[a].title,
                                description: items[a].description[0].substring(items[a].description[0].indexOf('src="') + ('strc=').length, aux.indexOf('"', 5) + ('strc=').length) /*items[i].description*/ ,
                                url: link, // link to the item
                                guid: items[a].title[0].match(/\[Cap*\.[0-9]*\]/)[0], // optional - defaults to url
                                //categories: ['Category 1', 'Category 2', 'Category 3', 'Category 4'], // optional - array of item categories
                                author: 'Eduardo Alvir', // optional - defaults to feed author property
                                date: new Date(items[a].pubDate[0]) //'May 25, 2012', // any format that js Date can parse.
                                    //lat: 33.417974, //optional latitude field for GeoRSS
                                    //long: -111.933231, //optional longitude field for GeoRSS,
                            });
                        } catch (err) {
                            console.log("No se ha podido leer el cuerpo de la pagina" + err.message);
                        }
                        //console.log('link--->' + link);
                        //console.log('Contador: ' + cont);
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

app.get('/rss/', function (req, res) {
    //console.log('cantidad items' + feedAct.item.length);

    res.send(feedAct.xml());
});

app.get('/rss2/', function (req, res) {
    //console.log('cantidad items' + feedAct.item.length);
    res.send(feedAct);
});


app.get('/rssAll/', function (req, res) {
    //console.log('cantidad items' + feedAct.item.length);

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
/*
app.get('/feedall/', function (req, res) {
    //console.log('cantidad items' + feedAct.item.length);
    res.send(Allitems.rss.channel[0].item);
});
*/
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
    res.send('<html><h1>No hay ninguna pagina en la ruta!!</h1></html>');
});


/*
app.listen(port);
console.log("SERVER UP on port:" + port);
recargaFeed();
*/ // catch 404 and forward to error handler
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
module.exports = app;
