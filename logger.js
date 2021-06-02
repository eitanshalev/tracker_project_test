const fs = require('fs');

 function logger(message){
    let log_file = fs.createWriteStream(__dirname+'/logs.log',{flags:'a'});
    //to string??
    log_file.write(message.toString());
    log_file.end('')
}
module.exports = logger;