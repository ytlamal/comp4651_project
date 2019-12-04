const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require('path');
var ffmpeg = require('ffmpeg');
//import {PythonShell} from 'python-shell';
const app = express();
app.use("/static",express.static(path.join(__dirname, "static")));
app.use("/temp",express.static(path.join(__dirname, "temp")));
const tempFolder = './temp/';
const fileFilter = function(req , file , cb){
	const allowtypes = [
	"image/jpeg",
	// "image/png",
	// "image/gif",
	"video/mp4",
	"video/quicktime"
	];
	
	if(!allowtypes.includes(file.mimetype)){
		const error = new Error("Wrong file type");
		error.code = "LIMIT_FILE_TYPES";
		return cb(error,false);
	}
	cb(null,true);
}


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() 
    	+path.extname(file.originalname)
    	);
  }
})
const upload = multer ({
	dest: './uploads/',
	fileFilter,
	//limits:{
	//	fileSize: MAX_SIZE
	//},
  	storage: storage

});
const pureUpload = multer({
	dest:"./uploads"

});
app.post("/upload", upload.single('file') ,(req,res) => {

	res.json({ file: req.file});
	
	//res.json({cool:"dddddd"});
});
app.post("/multiple", upload.array('files') ,(req,res) => {

	res.json({ files: req.files});
	
});
const { spawn } = require('child_process');
const events = require('events');

const myEmitter = new events.EventEmitter();
var arrayofimage=[];
function doA(file_path){
	return new Promise(function(resolve,reject){
		child = spawn('python',["./frame.py", file_path ],{detached: true});
		child.on('close', function(code,signal) {
		    resolve();
		    
		});
		
	})
}
function doB(){
	return new Promise(function(resolve,reject){
		console.log('start count')
		resolve(fs.readdirSync(tempFolder).forEach(file => {
			   		var newfile = `/temp/${file}`
			   		arrayofimage.push(newfile);
				    //console.log(newfile);
    	}))
	})
}
async function video_to_frame(file_path,res){

	console.log("start python process ")
	await doA(file_path)
	console.log("finish a")
	await doB()

	console.log("finish b")
	//process.kill("SIGINT");
	//
	
	return ;

	
	
}
app.post("/dropzone", upload.single('file') ,async (req,res) => {
	try{
		
		console.log(req.file.path);
		
		await video_to_frame(req.file.path,res);
		//res.json({file:arrayofimage});
		//fs.closeSync();
		child.unref();
		res.json("ok");

		//await return;
		console.log('ok');

		//fs.close();
		//process.exit(0); 
		return ;
		
		}catch(err){
			res.status(422).json({err});
			console.log(err.code);
			console.log(err.msg);
		}
		return;
});
app.use(function(err,req,res,next) {
	if(err.code ==="LIMIT_FILE_TYPES"){
		res.status(422).json({error:"only images are allowed"});
		return;
	}
	if(err.code ==="LIMIT_FILE_SIZE"){
		res.status(422).json({error:`too large Max size is ${MAX_SIZE/1000}Kb`});
		return;
	}
});

app.get('/uploads', (req, res) => {

	
});

app.listen(4000, ()=> console.log("Running on location:4000"));