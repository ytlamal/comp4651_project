var mongoose = require('mongoose');
var Schema = mongoose.Schema;

User_process_Schema = new Schema( {
	username: String, //videoname 
    status: String, //process status
	
}),
User_process = mongoose.model('User_process', User_process_Schema);

module.exports = User_process;