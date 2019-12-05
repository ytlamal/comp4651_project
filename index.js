var express = require('express');
var multer = require('multer');
bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Detail = require('./models/detail');
var image = require('./models/image');
var user_process = require('./models/user_process');
var dir = './uploads';
const sharp = require("sharp");
const fs = require("fs");
const path = require('path');
var ffmpeg = require('ffmpeg');

const app = express();
app.use("/static",express.static(path.join(__dirname, "static")));
app.use("/temp",express.static(path.join(__dirname, "temp")));
app.use("/output",express.static(path.join(__dirname, "output")));
const tempFolder = './temp/';
const outputFolder = './output/';
/*var upload = multer({ dest: 'uploads/' });*/
mongoose.connect(' mongodb://127.0.0.1:27017/comp4651',{ useNewUrlParser: true , useUnifiedTopology: true});

////redis 
var redis = require('redis');


//const PORT = process.env.PORT || 5000; //client
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

/////redis 


// Cache middleware used to get cached data only so is useless for this project 
function cache(req, res, next) {
	//console.log(req)
	console.log("cache")
	console.log(req.files[0].originalname)
  const { imgname } = req.files[0].originalname;

  client.get(req.files[0].originalname, (err, data) => {
  	console.log(data)
    if (err) throw err;

    if (data !== null) {
    	console.log("redis success")//i use this to check whether success or not
       
    } else {
      next();
    }
  });
}
/////////////////////////// upload setting 
const MAX_SIZE = 512000;
var upload = multer({
	dest: './uploads/',
	storage: multer.diskStorage({


  destination: function (req, file, callback) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, 'uploads');
  },
  limits:{
   fileSize: MAX_SIZE
  },
  filename: function (req, file, callback) 
  { callback(null, file.originalname );}

}),

/////////////////////  filter wrong file type

fileFilter: function(req, file, callback) {
  var ext = path.extname(file.originalname)
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg'&& ext !== '.mp4'&& ext !== '.mov') {
    return callback(/*res.end('Only images are allowed')*/ null, false)
  }
  callback(null, true)
}
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('uploads'));

////////main page
app.get('/',function(req, res){
	binimgfordata =[]
  ///////get data from mongodb start
  User_process.find({}, function(err,data){
  	console.log(data)
    if(err){
      console.log(err);
    }else{
    	var names=[];
    	for(i in data ){
       var name = splitstring(data[i].username);
       names.push(name);
   
    	 }
      res.render('index',{data:data,name:names,state:"showall"});
    }
  })
  ///////get data from mongodb end
  
});
var imgPath = './uploads/';

app.post('/', upload.any(), function(req,res){////cache used to get video from redis so i dont add it here 
  data=fs.readFileSync(req.files[0].path); //get binary data
  app.set(req.files[0].originalname, data); //upload to redis

  console.log('uploaded to redis')
  /////////useless as all pass to redis
  ///////////////////upload to mongodb start testing only start 
// if(!req.body && !req.files){
//     res.json({success: false});
//   } else {    
//     User_process.findOne({},function(err,data){
//         var user_process = new User_process({
//         username: req.files[0].originalname, //videoname 
//         status: "done", 
//         });
//        user_process.save(function(err, Person){
//         if(err)
//           console.log(err);
        

//       });
//     }).sort({_id: -1}).limit(1);
//     var name = splitstring(req.files[0].originalname);
//     var schema_name = "user_"+name;
//     var Images = mongoose.model(schema_name, image_Schema);
//     module.exports = Images;

//     var imagedata = (new Buffer.from(data)).toString('base64');
//     Images.findOne({},function(err,data){
//       var image = new Images({
//         "frameno": "1", //frame number
//         "name": req.files[0].originalname, //image name
//         "userid": "5dd3652b51c27c38305fd417", //user object id string
//         "base64": imagedata, //base64 encoded jpg,
//       });
//       image.save(function(err, Person){
//         if(err)
//           console.log(err);
        
//       });
//     }).sort({_id: -1}).limit(1);
//    Images.findOne({},function(err,data){
//       var image = new Images({
//         "frameno": "2", //frame number
//         "name": req.files[0].originalname, //image name
//         "userid": "5dd3652b51c27c38305fd417", //user object id string
//         "base64": imagedata, //base64 encoded jpg,
//       });
//       image.save(function(err, Person){
//         if(err)
//           console.log(err);
        
//       });
//     }).sort({_id: -1}).limit(1);
//   }
  //////////////////////

  ////////////////////upload to mongodb end testing only end
  res.redirect('/');
});

app.post('/delete',function(req,res){////delete data from mongodb

   User_process.findByIdAndRemove(req.body.prodId,function(err, data) {

    //console.log(data);

   })
  res
  .redirect('/');
});
////////////show specify collection
app.get('/:name', function(req, res) {
  console.log(req.params.name);
    binimgfordata =[];
 
    var schema_name = "user_"+req.params.name;
    var Images = mongoose.model(schema_name, image_Schema);
   
  Images.find({}, function(err,data){
    console.log(data)
    if(err){
      console.log(err);
    }else{
      var binimg =[]
      for(i in data ){

          var str = 'data:image/jpeg;base64,'+ data[i].base64;  
          binimg.push(str);

       }
 
       res.render('index',{name:schema_name,data:data,binimgfordata:binimg,state:"showone"});//pass result to index.ejs
    }
  })
});
const { spawn} = require('child_process');
const events = require('events');
var zip = require('bestzip');
const myEmitter = new events.EventEmitter();
var arrayofimage=[];
function splitstring(str){

  var res = str.split(".");
  return res[0];
}
function base64_encode(file) {//////i copied from web and not sure it works 
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}
function base64_decode(base64str, file) {//////i copied from web and not sure it works 
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

var port = 4000;
app.listen( port, function(){ console.log('listening on port '+port); } );

















