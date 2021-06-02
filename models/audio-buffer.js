
const getDB = require('../db').getAkivasDb;
const bson= require('bson')
var arraybuffer_to_buff = require('arraybuffer-to-buffer')
const fs = require('fs')
let lastTime;

const decrypt = require("../decryption")
class AudioBuffer {
    constructor(buffer, timestamp){
        this.buffer = new bson.Binary(buffer);
        this.timestamp = timestamp;
    }

    save(user) {


        const db = getDB();
        if(!db) {
            return Promise.resolve(-1)
        }
        return db
            .collection(user)
            .insertOne(this)
            .then(result => {
                //console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

    static getTimeRange(start, end, sessionID, user) {
    //try{
        //this try not needed??? not good cuz u need reboot in this  case
        try {
            const db = getDB();
            console.log("about to fetch in model..", new Date())
            const query = {
                timestamp: {
                    $gte: new Date(start),
                    $lt: new Date(end)
                }
            }
            let buffers = []
            let previous = -1;
            let gaps = {}
            let gapSeconds = 0;
            const WavFileWriter = require('wav').FileWriter;

            let outputFileStream;
            let file_path = `./${sessionID}.wav`

            outputFileStream = new WavFileWriter(file_path, {
                sampleRate: 46875,
                bitDepth: 16,
                channels: 1
            });
            if (!outputFileStream)
                console.log("badddd");

            outputFileStream.on("error", (error) => {
                    console.log("omggg")
                    try {
                        outputFileStream.end(error => {
                            if (error)
                                console.log("couldnt end", error)
                            // else
                            //     fs.unlink(`${sessionID}.wav`, ()=>{
                            //         try {
                            //             console.log("successful file deletion")
                            //         }
                            //         catch (e){
                            //             console.log("fhasdfh sjdalkfhlsd file deletion, ",e)
                            //         }
                            //         //  fs.close();
                            //     })
                        });
                        //const path = req.sessionID.toString() + req.query.window.toString();

                    } catch (e) {
                        console.log(e)
                        //   console.log("trying something else")
                    }
                }
            )

            if (outputFileStream) {
                console.log("hi")
                return db
                    .collection(user)
                    // .find({
                    //     timestamp: {
                    //         $gte: new Date(start),
                    //         $lt: new Date(end)
                    //     }
                    // }).sort({timestamp: 1})
                    .aggregate(
                        [
                            {
                                $match: {
                                    timestamp: {
                                        $gte: new Date(start),
                                        $lt: new Date(end)
                                    }
                                }
                            },
                            {$sort: {timestamp: 1}}
                        ],
                        {allowDiskUse: true}
                    )
                    .forEach((buffer) => {
                        //  try {
                        //not sure where, but must deal with exit session during file write!!!

                       // console.log("begin: ", new Date())
                        let second = ((buffer.buffer.buffer))
                        let t = buffer.timestamp;
                        if(previous == -1) {
                            gaps[gapSeconds] = t;
                        }
                        else
                        {
                            if(t- previous > 5000) {
                               // gaps[gapSeconds - 1] = previous;
                                gaps[gapSeconds] = t;
                            }
                        }
                        previous = t;
                        gapSeconds++;
                       // let index = 0;

                        for (let i = 0; i < 25; i++) {
                            // let piece = new Uint8Array(second.length/25)
                            // for(let j = 0; j < piece.length; j++)
                            // {
                            //     piece[j] = second[index];
                            //     index++;
                            // }

                            //DOUNLE CHECK THE 3760 VALUE!!!!!!!!
                            let piece = new Uint8Array(second.slice(3760 * i, 3760 * (i + 1)))
                            //   console.log(piece)
                            let buff = Buffer.from(decrypt(piece));
                            //  console.log("made it")
                            outputFileStream.write(buff, (error) => {
                                // console.log("wrote at index: ", ind, " for arr of size: ", arr)
                                if (error)
                                    console.log(error)
                                //lastTime = buffer.timestamp;
                         //       console.log("wrote")

                            });

                        }
                        //  }
                        //   catch(e){
                        //       console.log(e)
                        //  }
                     //   console.log("end: ", new Date())

                    })
                    .then(() => {
                        console.log("gap is:", gaps)
                        // while(true){
                        //     console.log("lastTime:", lastTime)
                        //  }
                        //     console.log("ending", end, " last: ", lastTime)
                        // //    while(new Date(lastTime) < new Date(end)) {
                        //
                        //     function x(l) {
                        //         console.log("ll", l)
                        //     }
                        //     setInterval(x, 2000, lastTime)
                        //
                        //     while(true) {
                        //
                        //         }


                        return new Promise(((resolve, reject) => {
                            outputFileStream.end(error => {
                                if (error)
                                    console.log(error)
                                console.log("now i really finished")
                                console.log("done writing all");
                                console.log("done fetching in model, about to return", new Date())
                                resolve(gaps)
                            });
                        }))
                        console.log("here at all?")


                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
            // }
            // catch(e){
            //     console.log(e)
            // }
        }
        catch (e){
        console.log(e)}
    }
}

module.exports = AudioBuffer;