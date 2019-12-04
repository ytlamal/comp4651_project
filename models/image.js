var mongoose = require('mongoose');
var Schema = mongoose.Schema;

image_Schema = new Schema( {
    "frameno": String, //frame number
    "name": String, //image name
    "userid": String, //user object id string
    "base64": String, //base64 encoded jpg,
	added_date:{
		type: Date,
		default: Date.now
	}
}),
Image = mongoose.model('Image', image_Schema);

module.exports = Image;