/*
const fetch = require('node-fetch');
const db = require('./db');
db.connectToDB((err,client)=>{
    if(err) console.log(err);
    collection = client.db("GPSGATE_LOCATION").collection("locations");
    const x = setInterval(fetchGPSGate,7000);
});

async function fetchGPSGate(){
    const responseFetchObj =  await fetch('http://localhost/comGpsGate/api/v.1/applications/1/tokens', {
        method : 'POST', //!*get...
        mode: 'cors',

        headers:{
            'Content-Type' :'application/json',
            'accept' : 'application/json'
        },

        body: JSON.stringify(  {'username' :'ken9728' ,'password' :'Thepoliceproject1'} )
    })
    const responseJson = await responseFetchObj.json();
    const tokenKey = responseJson.token;
    const getTrackObjResponse = await fetch("http://localhost/comGpsGate/api/v.1/applications/1/users/80456cfc-56a1-438b-84b9-3a10e4d14b96?Identifier=Username", {
        headers:{
            'accept' : 'application/json',
            'Authorization' : tokenKey
        }
    });
    const getTrack = await getTrackObjResponse.json();
    const trackedItem = {
        position:getTrack.trackPoint.position,
        timestamp:getTrack.trackPoint.utc

    };
    //console.log(getTrack)
    if(collection){
        collection.insertOne(trackedItem,(err,res)=>{
            if(err) throw err;
            console.log("Location has been inserted");
        })
    }


   // console.log(`Latitude: ${getTrack.trackPoint.position.latitude} Longitude:${getTrack.trackPoint.position.longitude} on time : ${getTrack.trackPoint.utc}`);
}

*/
const fetch = require('node-fetch');
const db = require('./db');
var logger2 = require('./logger');
const settings = require('./config');
let total;
db.connectToDB((err,client)=>{
    if(err) console.log(err);
    collection = client.db("GPSGATE_LOCATION").collection("locations");
    const x = setInterval(fetchGPSGate,settings.requestTimesGPSGate);
});


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = d.getHours(),
        minutes = d.getMinutes(),
        seconds = d.getSeconds();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    var time1=[hours,minutes,seconds].join(':');
    return [year, month, day].join('-')+' '+time1;
}
async function getToken(){

    const responseFetchObj =  await fetch('http://localhost/comGpsGate/api/v.1/applications/1/tokens', {
        method : 'POST', //*get...
        mode: 'cors',

        headers:{
            'Content-Type' :'application/json',
            'accept' : 'application/json'
        },

        body: JSON.stringify(  {'username' :'eitanshalev' ,'password' :'315511741ESes'} )
    })
 //  console.log('i amin token')
    const responseJson = await responseFetchObj.json();
    const token = responseJson.token;

    return token;
}


async function fetchAllTracks(){
    const tokenKey = await getToken();
    const getTrackObjResponse = await fetch("http://localhost/comGpsGate/api/v.1/applications/8/users?FromIndex=0&PageSize=1000", {
        headers:{
            'accept' : 'application/json',
            'Authorization' : tokenKey
        }
    });
    const tracks = await getTrackObjResponse.json();

    return tracks;
}

async function fetchGPSGate(){

    const getTracks = await  fetchAllTracks();
    getTracks.forEach((getTrack)=> {
        let gpsTime = new Date(getTrack.trackPoint.utc).toString()
        //let localDate = new Date(gpsTime).getTime();
        const trackedItem = {
            position: getTrack.trackPoint.position,
            timestamp: getTrack.trackPoint.utc,
            username: getTrack.username
        };
        //console.log(getTrack)

        if (collection) {
            collection.insertOne(trackedItem, (err, res) => {
                if (err) {
                    logger2(err);
                    throw err;
                }
                //console.log(trackedItem);
                //  console.log("Location has been inserted");
            })
        }
    });


    // console.log(`Latitude: ${getTrack.trackPoint.position.latitude} Longitude:${getTrack.trackPoint.position.longitude} on time : ${getTrack.trackPoint.utc}`);
}
module.exports = {fetchAllTracks};

