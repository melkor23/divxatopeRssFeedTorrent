exports.new = function (req, res) {
    var errors = req.session.errors || {};
    req.session.errors = {};
    res.render('login', { title:'login',errors: errors});
};

exports.create = function(req, res) {
console.log('Login!!!');
    var login     = req.body.login;
    var password  = req.body.password;

    console.log('Login: '+login);
    console.log('Password: '+password);
    var userController = require('./user_controller');
    userController.autenticar(login, password, function(error, user) {

        if (error) {  // si hay error retornamos mensajes de error de sesión
            req.session.errors = [{"message": 'Se ha producido un error: '+error}];
            res.redirect("/login");
            return;
        }

        // Crear req.session.user y guardar campos   id  y  username
        // La sesión se define por la existencia de:    req.session.user
        req.session.user = {id:user.id, username:user.username};
res.redirect("../feed");
        //res.redirect(req.session.redir.toString());// redirección a path anterior a login
    });
};


exports.destroy =function(req, res){
    delete req.session.user;
    res.redirect(req.session.redir.toString());
};



