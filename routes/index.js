var express = require('express');
const mongoUtil = require('../db');
const {fetchAllTracks} = require('../tracker')
var router = express.Router();
var arraybuffer_to_buff = require('arraybuffer-to-buffer')
const fs = require("fs");
const AudioBuffer = require('../models/audio-buffer')
const config = require('../config');
const speechToText = require('../speechToText');
const decryption = require('../decryption')
let mya;
let r;
const io = require('../socket')


/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index', { title: 'Express' });
});

router.get('/gpsGate',function(req,res){
    res.render('gpsGateIframe');
})

router.get('/getAllUsers',async function(req,res){
    const db = mongoUtil.getDB()
    const locations =  db.collection("locations");
    const distinctUsers = await locations.distinct('username');
    res.send(distinctUsers);
})

router.post('/getLocationsByTimeAndUser/:id',function(req,res) {

    const db = mongoUtil.getDB();
    //EITAN SHOULD THIS BE REQ.QUERY.ID???
    const userName = req.params.id;

    db.collection("locations").find({
        "timestamp": {$gte: req.body.fromDate, $lte: req.body.toDate},
        "username": userName
    }).toArray(function (err, result) {

        if (err) {
            console.log(err);
            return;
        }
        //console.log(result);
        res.send(result);

    })
});

router.post('/getLocationsByTime',function(req,res){

    const db = mongoUtil.getDB();
    console.log(req.body);
//console.log(req.body.fromDate);
    db.collection("locations").find({"timestamp":{$gte:req.body.fromDate,$lte:req.body.toDate}}).toArray(function (err,result){

        if(err){
            console.log(err);
            return;
        }
        //console.log(result);
        res.send(result);
    })
});

router.get('/getRealTimeLocation', async function(req,res){
    const db = mongoUtil.getDB();
    const tracks = await fetchAllTracks();
    console.log(tracks.length);
    db.collection("locations").find().limit(tracks.length).sort({$natural:-1}).toArray((err,results)=>{

        res.send(results);
    },(err)=>{res.status(500).send(err);})
})
router.get('')
/*
router.get('/getRealTimeLocation',function(req,res){
    const db = mongoUtil.getDB();
    db.collection("locations").find().limit(1).sort({$natural:-1}).next().then((doc)=>{
        console.log(doc);
        res.send(doc);
    },(err)=>{res.status(500).send(err);})
})
*/



const sample_rate = 46875;
const dgram = require('dgram');
const dgramserver = dgram.createSocket('udp4');

dgramserver.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    dgramserver.close();
});


dgramserver.on('listening', () => {
    const address = dgramserver.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

// for(var i=0; i <  config.users.size; i++) {
//     dgramserver.bind(config.users[i]);
//     console.log(config.users[i]);
// }
// for(var i of Object.values(config.users)){
//     dgramserver.bind(i);
//     console.log(i);
// }

dgramserver.bind(config.datagramPort);



let userList = new Map(); //ALL THESE this MUST BE PER DEVICE!!!!!!!!
//let userBools = new Map();
//let flag = true;
//let audioBuff;
dgramserver.on('message', (msg, rinfo) => {
    //console.log("lengh", msg.length)
    let audioBuff;
    let user =  Object.keys(config.users).find(key => config.users[key] === rinfo.port)
    if(!user){
        console.log("bad user")
        return ;
    }
    if(!userList.get(rinfo.port)) {
        userList.set(rinfo.port, {flag: true, second: []});
    }


    // console.log(io.getSockets());

  //  console.log("ms", msg)
    audioBuff = arraybuffer_to_buff(msg);
    //console.log("aud", audioBuff)

    //fix this part out of onmessage
    //************************************* decrepyt


    let decrypted = decryption(audioBuff);


    io.getSockets().forEach(socket =>{
        if(socket[0] == user)
            socket[1].emit('message', decrypted);
    })

    //PLACE MUTEX??
    io.googleSockets().forEach(socket => {
        if(socket[0] == user) {
            let googleRequest;
            if(socket[2]) {
                socket[2] = false;
               // let apiRequest = (speechToText.makeRequest(socket[1]));
               //socket.push(apiRequest);
                //apiRequest.begin();
                //
                googleRequest = (speechToText.getA(socket[1]))
                //socket.push(apiRequest);
                let r = googleRequest.readStream;
                googleRequest.startStream();
                if(r)
                    socket.push(r)
            }
            else {
                socket[3].push(decrypted);
            }
        }
    })


    //maybe use mutex or js Atomics? or dont bother cuz it works... or just if u have time at the end
    if(userList.get(rinfo.port).second.length < 25)
        userList.get(rinfo.port).second.push(msg);
    else if(userList.get(rinfo.port).flag)
    {
        
        userList.get(rinfo.port).flag = false;
        const sum = Buffer.concat(userList.get(rinfo.port).second);
        userList.get(rinfo.port).second = []
        userList.get(rinfo.port).second.push(msg);
        let timestamp = new Date();

        //must change this to real-time diff between israel and gmt
        timestamp.setHours(timestamp.getHours()+3);
        const audioBuffer = new AudioBuffer(sum, timestamp);
        audioBuffer
            .save(user)
            .then(result => {
                if(result == -1)
                 console.log("DB not yet connected")

            })
            .catch(err => {
                console.log(err);
            });
        userList.get(rinfo.port).flag = true;
    }

    //console.log(audioBuff);

});

dgramserver.on('close', () => {
    console.log("closed")
})

router.get('/clip/:id', function(req, res, next) {

    let videoStream;

    const range = req.headers.range;
   // oh = true;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const path  = req.sessionID.toString() + req.query.window.toString();
    const videoPath = `${path}.wav`;
    console.log("???")

    const videoSize = fs.statSync(videoPath).size;
    console.log("vid size", videoSize)

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    console.log(start)
    console.log(end,"ll")

    // Create headers
    const contentLength = end - start + 1;
    console.log("contlen", contentLength);
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "audio/wav",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    videoStream = fs.createReadStream(videoPath, {start, end});

    // Stream the video chunk to the client
    videoStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        videoStream.pipe(res);
        //videoStream.unpipe(res);
    });
    //videoStream.pipe(res);
    videoStream.on('error', function(err) {
        videoStream.end();
        res.end(err);
    })
    //videoStream.pipe(res);
    // req.on("end", ()=>{
    //     try{
    //         console.log("here in req.on")
    //         fs.unlinkSync(`${req.sessionID}.wav`, ()=>{
    //             console.log("successful file deletion")
    //
    //         })
    //     }
    //     catch (e)
    //     {
    //         console.log(e)
    //         //   console.log("trying something else")
    //     }
    // })
});


router.get('/past/', function(req, res, next) {
    console.log("ABOUT TO CREATE FILE..")

    //console.log(io.getSockets());
    let from = req.query.from;
    let until = req.query.until;
    let user = req.query.user.toString();
    let windowID = req.query.window.toString();
    console.log("user:", user);

    from += ':00.000+00:00';
    until += ':00.000+00:00';
    console.log("ABOUT TO FETCH FROM DB", from, until)

    console.log("ABOUT TO FETCH FROM DB", (new Date()))
    console.log("sess", req.sessionID);
    const path = req.sessionID.toString() + windowID;
    console.log("my path is: ", path)

   // let username =  Object.keys(config.users).find(key => config.users[key] === parseInt(user))
   // console.log("username:", username)
    AudioBuffer.getTimeRange(from, until, path, user).then(markers => {

        console.log("bak at index.js");
        // console.log("DONE FETCHING DATA. ABOUT TO CREATE FILE", new Date() )

        setTimeout(resp, 500); //instead try outpufilestream.on(event????
        function resp() {
            res.send(JSON.stringify(markers))
        }


        console.log(from, until)
        // get video stats (about 61MB)


    });


})

router.get('/delete', function(req, res, next) {

    //continues to write even after close!!!
    //this try doesnt work! must but in callback!! fix the callback
    try{
        const path = req.sessionID.toString() + req.query.window.toString();
        fs.unlink(`${path}.wav`, ()=>{
            try {
                console.log("successful file deletion")
            }
            catch (e){
                console.log("fhasdfh sjdalkfhlsd file deletion, ",e)
            }
          //  fs.close();
        })
    }
    catch (e)
    {
       console.log(e)
     //   console.log("trying something else")
    }
})

var wavFileInfo = require('wav-file-info');

router.get('/speechToTextPast',  function(req, res, next) {
    const windowId = req.query.window;
    if(windowId) {
        console.log("abou to makeA")
        const path  = req.sessionID.toString() + req.query.window.toString() + '.wav';

        // let musicDuration = require('music-duration');
        //
        // musicDuration(path)
        //     .then(duration => {
        //         console.log(`Your file is ${duration} seconds long`);
        //
        //     })
        //     .catch(e => {
        //         console.err(e);
        //     });


        wavFileInfo.infoByFilename(path, function(err, info){
            console.log("index.js duration", info.duration)
            let apiRequest = speechToText.getA(null, path, res, info.duration * 1000);
            console.log(apiRequest.startStream());
            req.on('close', (function(){
                apiRequest.stop();
            }).bind(this));
            if (err) throw err;
            console.log(info);
        });



    }

    //res.send("hey you")
})


module.exports = router;
