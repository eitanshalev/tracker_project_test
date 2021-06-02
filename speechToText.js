//
//
// "use strict";
//
// const chalk = require('chalk');
// const Stream = require('stream')
// const {Writable} = require('stream');
// const fs = require('fs');
// // Imports the Google Cloud client library
// // Currently, only v1p1beta1 contains result-end-time
// const speech = require('@google-cloud/speech').v1p1beta1;
//
// const client = new speech.SpeechClient();
//
// let encoding = 'LINEAR16'
// let sampleRateHertz = 46875
// let  languageCode = 'en-US'
// let  streamingLimit = 10000
//
// const request = {
//     config: {
//         encoding: encoding,
//         sampleRateHertz: sampleRateHertz,
//         languageCode: languageCode,
//         diarizationConfig: {enableSpeakerDiarization: true},
//        // enableAutomaticPunctuation: true, may cause issues
//
//     }
//     //interimResults: true,
// };
//
//
//
//
//
// class A {
//     constructor(socket, path, res) {
//         //console.log("in ocnstructor: sock, path: ", socket, " ",path)
//         if(socket) {
//          //   this.socketData = socket;
//             this.socket = socket
//             this.readStream = new Stream.Readable();
//             this.readStream._read = function () {
//             };
//         }
//         else if(path){
//             //try???!!
//             this.readStream = fs.createReadStream(path);
//             this.res = res;
//             this.finalTrascript = [];
//             this.diarization = [];
//             this.speakerCount = 0;
//
//         }
//         this.finshed = false;
//         this.restartCounter = 0,
//             this.audioInput = [],
//             this.lastAudioInput = [],
//             this.resultEndTime = 0,
//             this.isFinalEndTime = 0,
//             this.finalRequestEndTime = 0,
//             this.newStream = true,
//             this.bridgingOffset = 0,
//             this.lastTranscriptWasFinal = false,
//             this.recognizeStream = null,
//             //readStream= readStream,
//             this.spoke = false,
//             this.o = 77;
//         console.log(this.bridgingOffset)
//         this.audioStreamInputTransform = new Writable({
//
//                     final() {
//                         if (this.recognizeStream) {
//                             this.recognizeStream.end();
//                         }
//                     },
//                 })
//
//         this.audioStreamInputTransform._write = (chunk, encoding, next) => {
//                // console.log(this.o)
//            // console.log("brihe b4", this.bridgingOffset)
//            // console.log(this.lastAudioInput.length)
//             //console.log(this.newStream)
//                 if (this.newStream && this.lastAudioInput.length !== 0) {
//                     // Approximate math to calculate time of chunks
//                     console.log("eajfkjs")
//                     const chunkTime = streamingLimit / this.lastAudioInput.length;
//                     if (chunkTime !== 0) {
//                         if (this.bridgingOffset < 0) {
//                             this.bridgingOffset = 0;
//                         }
//                         if (this.bridgingOffset > this.finalRequestEndTime) {
//                             this.bridgingOffset = this.finalRequestEndTime;
//                         }
//                         console.log("brihe aft", this.bridgingOffset)
//
//                         const chunksFromMS = Math.floor(
//                             (this.finalRequestEndTime - this.bridgingOffset) / chunkTime
//                         );
//                         this.bridgingOffset = Math.floor(
//                             (this.lastAudioInput.length - chunksFromMS) * chunkTime
//                         );
//
//                         for (let i = chunksFromMS; i < this.lastAudioInput.length; i++) {
//                             if(this.recognizeStream)
//                                 this.recognizeStream.write(this.lastAudioInput[i]);
//                         }
//                     }
//                     this.newStream = false;
//
//                   //  console.log(this.bridgingOffset)
//                 }
//        //     console.log(this.bridgingOffset)
//
//             //console.log("got this far")
//                 this.audioInput.push(chunk);
//
//                 if (this.recognizeStream) {
//                     this.recognizeStream.write(chunk);
//                 }
//
//                 next();
//         }
//         this.readStream.pipe(this.audioStreamInputTransform);
//
//         this.onData = ((stream)=> {
//
//             // process.stdout.write(
//             //             stream.results[0] && stream.results[0].alternatives[0]
//             //                 ? ''
//             //                 : '\n\nReached transcription time limit, press Ctrl+C\n'
//             //         )
//             // const result = data.results[0];
//             this.diarization = stream.results[stream.results.length - 1].alternatives[0].words;
//             const wordsInfo = stream.results[stream.results.length - 1].alternatives[0].words
//             //      console.log("words num", wordsInfo.length)
//             //console.log(data.results[data.results.length - 1].alternatives[0].transcript)
//             wordsInfo.forEach(a =>
//                 console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
//             );
//
//             this.spoke = true;
//             let counter = new Map()
//
//
//             // let aatend = atend[i].words
//             wordsInfo.forEach(a =>
//                 counter.set(a.speakerTag, 0)
//             );
//
//
//             wordsInfo.forEach(a => {
//                     counter.set(a.speakerTag, (counter.get(a.speakerTag) + 1))
//                     //console.log(`x`)
//                     //console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
//                 }
//             );
//             //if (counter.size != 0)
//                 console.log(counter)
//
//
//             // Convert API result end time from seconds + nanoseconds to milliseconds
//             this.resultEndTime =
//                 stream.results[0].resultEndTime.seconds * 1000 +
//                 Math.round(stream.results[0].resultEndTime.nanos / 1000000);
//
//             //console.log(this.resultEndTime)
//             // Calculate correct time based on offset from audio sent twice
//             const correctedTime =
//                 this.resultEndTime - this.bridgingOffset + streamingLimit * this.restartCounter;
//
//             //    console.log(this.bridgingOffset, " ", streamingLimit, " ", this.restartCounter)
//             //process.stdout.clearLine();
//             //process.stdout.cursorTo(0);
//             let stdoutText = '';
//             if (stream.results[0] && stream.results[0].alternatives[0]) {
//                 stdoutText =
//                     correctedTime + ': ' + stream.results[0].alternatives[0].transcript;
//             }
//
//
//             if (stream.results[0].isFinal) {
//
//
//                 if(this.res) {
//                     this.speakerCount = counter.size;
//                     let transcriptAsArr = stream.results[0].alternatives[0].transcript.trim().split(" ");
//                     this.finalTrascript.push([correctedTime, transcriptAsArr]);
//                     // this.finalTrascript.forEach((ele) =>{
//                     //     ele.forEach(word => {
//                     //
//                     //     })
//                     // })
//                 }
//                 let ioResponse= {};
//
//                 ioResponse.speakerCount = counter.size;
//                 ioResponse.transcript = stream.results[0].alternatives[0].transcript;
//                 ioResponse.time  = correctedTime;
//                 if(this.socket)
//                     this.socket.emit('message', ioResponse);
//
//                 //process.stdout.write(chalk.green(`${stdoutText}\n`));
//                 console.log(stdoutText + '\n')
//                 this.isFinalEndTime = this.resultEndTime;
//                 this.lastTranscriptWasFinal = true;
//             } else {
//                 // Make sure transcript does not exceed console character length
//                 if (stdoutText.length > process.stdout.columns) {
//                     stdoutText =
//                         stdoutText.substring(0, process.stdout.columns - 4) + '...';
//                 }
//                 //process.stdout.write(chalk.red(`${stdoutText}`));
//                 console.log(stdoutText + '\n')
//
//
//                 this.lastTranscriptWasFinal = false;
//             }
//         }).bind(this)
//
//     }
//
//
//                 stop() {
//                     if (this.recognizeStream) {
//                         console.log("cut loose!")
//                         this.recognizeStream.end();
//                         this.recognizeStream.removeListener('data', this.onData)
//                         this.recognizeStream = null;
//                     }
//                 }
//                 startStream()
//                 {
//                     // Clear current audioInput
//                     console.log("did i start????")
//                     var inter = setInterval(function () {
//                         if(!this.spoke) {
//                             console.log("Zero speakers");
//
//                             if(this.socket)
//                                 this.socket.emit('message', {speakerCount: 0})
//                         }
//                         else
//                             clearInterval(inter)
//
//                     }.bind(this), 10000);
//                     this.audioInput = [];
//                     // Initiate (Reinitiate) a recognize stream
//                     this.recognizeStream = client
//                         .streamingRecognize(request)
//                         .on('error', err => {
//
//                             if(this.socket) {
//                                 if (err.code === 11) {
//                                     // restartStream();
//                                     console.log("error 11? no audio", err)
//                                     this.socket.emit('message', {speakerCount: -1});
//
//                                 } else if (err.code == 'ERR_STREAM_DESTROYED') {
//                                     console.error('API request error ' + err);
//                                     console.log("finished because error", err.code)
//
//                                 } else
//                                     this.socket.emit('message', {speakerCount: -2, transcript: err});
//                             }
//                          //   console.log("username?????", this.socketData[0], this.socketData[2])
//                            // this.socketData[2] = true;
//                            // console.log("username?????", this.socketData[0], this.socketData[2])
//                             this.finshed = true;
//                             clearInterval(inter)
//
//                         })
//                         //BECAUSE ONLY IF ITS A FILE!!!
//                         .on('end', () => {
//                           // //  return "got back here"
//                           //   if(this.socket)
//                           //       return;
//                           //
//                           //   this.finshed = true;
//                           //   clearInterval(inter)
//                           //   console.log("finishedddd")
//                           //
//                           //   if(this.res && !this.res.headersSent) {
//                           //       let index = 0;
//                           //       // this.diarization.forEach((word)=>{
//                           //       //
//                           //       // })
//                           //       this.finalTrascript.forEach((ele) =>{
//                           //           ele[1].forEach((word, i)=>{
//                           //              ele[1][i] = [word, this.diarization[index].speakerTag]
//                           //               index++;
//                           //           })
//                           //
//                           //       })
//                           //       this.res.send(JSON.stringify({speakerCount: this.speakerCount, transcript: this.finalTrascript}));
//                           //
//                           //   }
//                             // // for (let i =0; i < atend.length; i++) {
//                             // let counter = new Map()
//                             //
//                             // // let aatend = atend[i].words
//                             // atend.forEach(a =>
//                             //     counter.set(a.speakerTag, 0)
//                             // );
//                             //
//                             //
//                             // atend.forEach(a => {
//                             //         counter.set(a.speakerTag, (counter.get(a.speakerTag) + 1))
//                             //         //console.log(`x`)
//                             //         //console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
//                             //     }
//                             // );
//                             //
//                             // console.log(counter)
//                             // }
//
//                         })
//                         .on('data', this.onData)
//
//                     console.log("finished var is ", this.finshed)
//                     // Restart stream when streamingLimit expires
//
//                     if(!this.finshed)
//                     setTimeout((()=>{
//                         if (this.recognizeStream) {
//                             this.recognizeStream.end();
//                             //has no effet!!
//
//                             this.recognizeStream.removeListener('data', this.onData)
//
//                             this.recognizeStream = null;
//                         }
//                         if (this.resultEndTime > 0) {
//                             this.finalRequestEndTime = this.isFinalEndTime;
//                         }
//                         this.resultEndTime = 0;
//
//                         this.lastAudioInput = [];
//                         this.lastAudioInput = this.audioInput;
//
//                         this.restartCounter++;
//
//                         if (!this.lastTranscriptWasFinal) {
//                             process.stdout.write('\n');
//                         }
//                         process.stdout.write(
//                             chalk.yellow(`${streamingLimit * this.restartCounter}: RESTARTING REQUEST\n`)
//                         );
//
//                         this.spoke = false;
//                         this.newStream = true;
//                         clearInterval(inter)
//                         this.startStream();
//                     }), streamingLimit);
//                     else {
//                         if(this.recognizeStream) {
//                             this.recognizeStream.end();
//                             this.recognizeStream.removeListener('data', this.onData);
//                             this.recognizeStream = null;
//                         }
//
//                         clearInterval(inter)
//                     }
//                 }
//
//     restartStream() {
//         if (this.recognizeStream) {
//             this.recognizeStream.end();
//             this.recognizeStream.removeListener('data', this.speechCallback);
//             this.recognizeStream = null;
//         }
//         if (this.resultEndTime > 0) {
//             this.finalRequestEndTime = this.isFinalEndTime;
//         }
//         this.resultEndTime = 0;
//
//         this.lastAudioInput = [];
//         this.lastAudioInput = this.audioInput;
//
//         this.restartCounter++;
//
//         if (!this.lastTranscriptWasFinal) {
//             process.stdout.write('\n');
//         }
//         process.stdout.write(
//             chalk.yellow(`${streamingLimit * this.restartCounter}: RESTARTING REQUEST\n`)
//         );
//
//         this.newStream = true;
//
//         this.startStream();
//     }
//
// }
// module.exports = {
//     getA: (socket, path, res) => {
//         return new A(socket, path, res);
//     },
//
// }
//
//
//
//
//

"use strict";

const chalk = require('chalk');
const Stream = require('stream')
const {Writable} = require('stream');
const fs = require('fs');
// Imports the Google Cloud client library
// Currently, only v1p1beta1 contains result-end-time
const speech = require('@google-cloud/speech').v1p1beta1;


let encoding = 'LINEAR16'
let sampleRateHertz = 46875
let  languageCode = 'en-US'
let  streamingLimit = 10000

const request = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        diarizationConfig: {enableSpeakerDiarization: true},
       enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,


    }
    //interimResults: true,
};





class A {
    constructor(socket, path, res) {
        //console.log("in ocnstructor: sock, path: ", socket, " ",path)
        this.readStream = new Stream.Readable();
        this.client = new speech.SpeechClient();

        if(socket) {
         //   this.socketData = socket;
            this.socket = socket
            this.readStream._read = function () {
            };
        }
        else if(path){
            //try???!!
            this.readStream = fs.createReadStream(path);
            this.res = res;
            this.finalTrascript = [];
            this.diarization = [];
            this.speakerCount = 0;
        }
            this.finalTrascript = []
            this.recognizeStream = null,
            //readStream= readStream,
            this.spoke = false,

            //    console.log(this.readStream)
        // this.readStream.pipe(this.recognizeStream);

        this.onData = ((stream)=> {

            // process.stdout.write(
            //             stream.results[0] && stream.results[0].alternatives[0]
            //                 ? ''
            //                 : '\n\nReached transcription time limit, press Ctrl+C\n'
            //         )
            // const result = data.results[0];
            this.diarization = stream.results[stream.results.length - 1].alternatives[0].words;
            const wordsInfo = stream.results[stream.results.length - 1].alternatives[0].words
            //      console.log("words num", wordsInfo.length)
            //console.log(data.results[data.results.length - 1].alternatives[0].transcript)
            // wordsInfo.forEach(a =>
            //     console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
            // );
            console.log("data");
            if(this.res)
            {
                console.log("res is not null")
            }
            this.spoke = true;
            let counter = new Map()


            // let aatend = atend[i].words
            wordsInfo.forEach(a =>
                counter.set(a.speakerTag, 0)
            );


            wordsInfo.forEach(a => {
                    counter.set(a.speakerTag, (counter.get(a.speakerTag) + 1))
                    //console.log(`x`)
                    //console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
                }
            );
            //if (counter.size != 0)
                console.log(counter)


            // Convert API result end time from seconds + nanoseconds to milliseconds
            this.resultEndTime =
                stream.results[0].resultEndTime.seconds * 1000 +
                Math.round(stream.results[0].resultEndTime.nanos / 1000000);

            //console.log(this.resultEndTime)
            // Calculate correct time based on offset from audio sent twice
            // const correctedTime =
            //     this.resultEndTime - this.bridgingOffset + streamingLimit * this.restartCounter;

            //    console.log(this.bridgingOffset, " ", streamingLimit, " ", this.restartCounter)
            //process.stdout.clearLine();
            //process.stdout.cursorTo(0);
            // let stdoutText = '';
            // if (stream.results[0] && stream.results[0].alternatives[0]) {
            //     stdoutText =
            //         this.resultEndTime + ': ' + stream.results[0].alternatives[0].transcript;
            // }


            if (stream.results[0].isFinal) {

                this.speakerCount = counter.size;
                // if(this.res) {
                //     this.speakerCount = counter.size;
                //     let transcriptAsArr = stream.results[0].alternatives[0].transcript.trim().split(" ");
                //     this.finalTrascript.push([this.resultEndTime, transcriptAsArr]);
                //     // this.finalTrascript.forEach((ele) =>{
                //     //     ele.forEach(word => {
                //     //
                //     //     })
                //     // })
                // }
                let ioResponse= {};

                ioResponse.speakerCount = counter.size;
                ioResponse.transcript = stream.results[0].alternatives[0].transcript;
                ioResponse.time  = this.resultEndTime;
                if(this.socket)
                    this.socket.emit('message', ioResponse);

                //process.stdout.write(chalk.green(`${stdoutText}\n`));
//                console.log(stdoutText + '\n')
            //    this.isFinalEndTime = this.resultEndTime;
              //  this.lastTranscriptWasFinal = true;
            } else {
                // Make sure transcript does not exceed console character length
                // if (stdoutText.length > process.stdout.columns) {
                //     stdoutText =
                //         stdoutText.substring(0, process.stdout.columns - 4) + '...';
                // }
                //process.stdout.write(chalk.red(`${stdoutText}`));
                console.log(stdoutText + '\n')


               // this.lastTranscriptWasFinal = false;
            }
        }).bind(this)

    }


                stop() {
                    if (this.recognizeStream) {
                        console.log("cut loose!")
                        this.recognizeStream.end();
                        this.recognizeStream.removeListener('data', this.onData)
                        this.recognizeStream = null;
                    }
                }
                startStream()
                {

                    // Clear current audioInput
                    console.log("did i start????")
                    var inter = setInterval(function () {
                        if(!this.spoke) {
                            console.log("Zero speakers");

                            if(this.socket)
                                this.socket.emit('message', {speakerCount: 0})
                        }
                        else
                            clearInterval(inter)

                    }.bind(this), 10000);
                 //   this.audioInput = [];
                    // Initiate (Reinitiate) a recognize stream
                    this.recognizeStream = this.client
                        .streamingRecognize(request)
                        .on('error', err => {

                            if(this.socket) {
                                if (err.code === 11) {
                                    // restartStream();
                                    console.log("error 11? no audio", err)
                                    if(err.toString().includes("maximum")) {
                                        this.socket.emit('message', {speakerCount: -3});
                                        console.log('exceeded!!')
                                    }

                                    this.socket.emit('message', {speakerCount: -1});

                                } else if (err.code == 'ERR_STREAM_DESTROYED') {
                                    console.error('API request error ' + err);
                                    console.log("finished because error", err.code)

                                } else
                                    this.socket.emit('message', {speakerCount: -2, transcript: err});
                            }
                         //   console.log("username?????", this.socketData[0], this.socketData[2])
                           // this.socketData[2] = true;
                           // console.log("username?????", this.socketData[0], this.socketData[2])
                         //   this.finshed = true;
                            clearInterval(inter)

                        })
                        //BECAUSE ONLY IF ITS A FILE!!!
                        .on('end', () => {
                          //  return "got back here"
                            if(this.socket)
                                return;

                         //   this.finshed = true;
                            clearInterval(inter)
                            console.log("finishedddd")

                            if(this.res && !this.res.headersSent) {
                                let index = 0;
                                // this.diarization.forEach((word)=>{
                                //
                                // })
                                // this.finalTrascript.forEach((ele) =>{
                                //     ele[1].forEach((word, i)=>{
                                //        ele[1][i] = [word, this.diarization[index].speakerTag]
                                //         index++;
                                //     })
                                //
                                // })
                                let finalRes = [];
                                this.diarization.forEach((word)=>{
                                    let time = `${word.startTime.seconds}` +
                                    '.' +
                                    word.startTime.nanos / 100000000;

                                    finalRes.push([time, word.speakerTag, word.word])
                                })
                                this.res.send(JSON.stringify({speakerCount: this.speakerCount, transcript: finalRes}));

                            }
                            // // for (let i =0; i < atend.length; i++) {
                            // let counter = new Map()
                            //
                            // // let aatend = atend[i].words
                            // atend.forEach(a =>
                            //     counter.set(a.speakerTag, 0)
                            // );
                            //
                            //
                            // atend.forEach(a => {
                            //         counter.set(a.speakerTag, (counter.get(a.speakerTag) + 1))
                            //         //console.log(`x`)
                            //         //console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
                            //     }
                            // );
                            //
                            // console.log(counter)
                            // }

                        })
                        .on('data', this.onData)
                    this.readStream.pipe(this.recognizeStream);

                    //  console.log("finished var is ", this.finshed)
                    // Restart stream when streamingLimit expires

                    // if(!this.finshed)
                    // setTimeout((()=>{
                    //     if (this.recognizeStream) {
                    //         this.recognizeStream.end();
                    //         //has no effet!!
                    //
                    //         this.recognizeStream.removeListener('data', this.onData)
                    //
                    //         this.recognizeStream = null;
                    //     }
                    //     if (this.resultEndTime > 0) {
                    //         this.finalRequestEndTime = this.isFinalEndTime;
                    //     }
                    //     this.resultEndTime = 0;
                    //
                    //     this.lastAudioInput = [];
                    //     this.lastAudioInput = this.audioInput;
                    //
                    //     this.restartCounter++;
                    //
                    //     if (!this.lastTranscriptWasFinal) {
                    //         process.stdout.write('\n');
                    //     }
                    //     process.stdout.write(
                    //         chalk.yellow(`${streamingLimit * this.restartCounter}: RESTARTING REQUEST\n`)
                    //     );
                    //
                    //     this.spoke = false;
                    //     this.newStream = true;
                    //     clearInterval(inter)
                    //     this.startStream();
                    // }), streamingLimit);
                    // else {
                    //     if(this.recognizeStream) {
                    //         this.recognizeStream.end();
                    //         this.recognizeStream.removeListener('data', this.onData);
                    //         this.recognizeStream = null;
                    //     }
                    //
                    //     clearInterval(inter)
                    // }
                }


}
module.exports = {
    getA: (socket, path, res) => {
        return new A(socket, path, res);
    },
}