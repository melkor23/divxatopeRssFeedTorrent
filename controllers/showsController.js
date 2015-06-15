var fs = require("fs");


exports.additem = function (req, res) {

    console.log('Esta autenticado ' + (req.session.user != null));
    if (req.session.user != null) {
        console.log('User ok');
        console.log('User ok');
        console.log('User ok');
        if (req.query != null && req.query.nombre != null) {
            var filtros = JSON.parse(fs.readFileSync('./filtros.json', 'utf8'));
            console.log(filtros.length);
            var date = new Date();
            var strDate=date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            filtros.push({
                containsStr: [req.query.nombre],
                ignoreStr: [],
                quality: "",
                user:req.session.user,
                dateAdded: strDate
            });


            console.log('escribimos query name: '+req.query.nombre );
            fs.writeFileSync('./filtros.json', JSON.stringify(filtros, null, 2), 'utf-8');
            console.log('escrita la info');

            res.sendStatus(200);
        }
    } else {
        res.sendStatus(401);
    }

}
