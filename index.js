var express = require('express');
var multer = require('multer');
bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Detail = require('./models/detail');
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
mongoose.connect(' mongodb://127.0.0.1:27017/my_datablase',{ useNewUrlParser: true , useUnifiedTopology: true});

////redis 
var redis = require('redis');


const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

/////redis 


// Cache middleware
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


app.get('/',function(req, res){
	binimgfordata =[]
  ///////get data from mongodb start
  Detail.find({}, function(err,data){
  	console.log(data)
    if(err){
      console.log(err);
    }else{
    	
    	for(datas in data ){
        binimg =[]
    		
        for(i in data[datas].data){
          var str = 'data:image/jpeg;base64,'+ (new Buffer.from(data[datas].data[i].buffer)).toString('base64');  
          binimg.push(str);
        }

    	 	binimgfordata.push(binimg)
    	 }
 
    	 res.render('index',{data:data,binimgfordata:binimgfordata});//pass result to index.ejs
    }
  })
  ///////get data from mongodb end
  
});
var imgPath = './uploads/';

app.post('/', upload.any(), function(req,res){////cache used to get video from redis  
  data=fs.readFileSync(req.files[0].path);
  app.set(req.files[0].originalname, data);

  console.log('uploaded to redis')
  /////////useless as all pass to redis
  ///////////////////upload to mongodb start
  // if(!req.body && !req.files){
  //   res.json({success: false});
  // } else {    
  //   var c;
  //   Detail.findOne({},function(err,data){
  //     console.log("into detail");

  //     if (data) {
  //       console.log("if");
  //       c = data.unique_id + 1;
  //     }else{
  //       c=1;
  //     }

  //     var detail = new Detail({

  //       unique_id:c,
  //       Name: req.body.title,
  //       data:fs.readFileSync(req.files[0].path),
  //             });
  //     detail.save(function(err, Person){
  //       if(err)
  //         console.log(err);
  //       else
  //         res.redirect('/');

  //     });

  //   }).sort({_id: -1}).limit(1);

  // }
  ////////////////////upload to mongodb end
  res.redirect('/');
});

app.post('/delete',function(req,res){////delete data from mongodb

   Detail.findByIdAndRemove(req.body.prodId,function(err, data) {

    //console.log(data);

   })
  res
  .redirect('/');
});
const { spawn} = require('child_process');
const events = require('events');
var zip = require('bestzip');
const myEmitter = new events.EventEmitter();
var arrayofimage=[];

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

















