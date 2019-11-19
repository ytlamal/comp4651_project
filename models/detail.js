var mongoose = require('mongoose');
var Schema = mongoose.Schema;

detailSchema = new Schema( {
	unique_id:Number,
	// Name: String,
	// image1:String,
	
	// data: Buffer,
	// contentType: String,
	// image2:String,
	
	Name: String,
	data: [Buffer],
	added_date:{
		type: Date,
		default: Date.now
	}
}),
Detail = mongoose.model('Detail', detailSchema);

module.exports = Detail;