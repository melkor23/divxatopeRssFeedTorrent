var md5 = require('MD5');

//password md5
var users = {melkor23: {id:1, username:"Edu", password:"0c938aa0f25a1c74fd23da81ff581466"},
             bauglir23:  {id:2, username:"Edu", password:"0c938aa0f25a1c74fd23da81ff581466"}
};

exports.autenticar = function(login, password, callback){
  if (users[login]){
      console.log("login");

      console.log('md5 input Password: ' +md5(password));
      console.log('md5 Password: '+users[login].password);


    if(md5(password) === users[login].password){
      callback(null, users[login]);
    }
    else {callback (new Error('Password Erroneo'));}
  }else {callback (new Error ('No existe el usuario'));}
};


