//(function (){ WRAP THIS!!!!!!!!!
(function(){
    populateUsersSelect();

})();

let audioGaps = []
let audioSource = false;
var inter;
var dropdownSelect;
let controller = null;
let speechController = null;
var speechToTextSocket;
//var video;
let video;
const windowID = Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
console.log(windowID)
let colors = ['green','blue','red','yellow','purple','pink']
function initMap(locations_map){
    if(!locations_map || locations_map.length === 0){
        return;
    }
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: new google.maps.LatLng(31.771959,35.217018)
    });

    const bounds = new google.maps.LatLngBounds();

    const infoWindow = new google.maps.InfoWindow();

    for(const [user,locations] of locations_map.entries()) {

        if(colors.length ===0){
             colors = ['green','blue','red','yellow','purple','pink']
        }
        let colorID=Math.floor(Math.random()*(colors.length-1));
        let color =colors[colorID];
        colors.splice(colorID,1);


        let url = "http://maps.google.com/mapfiles/ms/icons/";
        url += color + "-dot.png";
        for (let i = 0; i < locations.length; i++) {

            var marker = new google.maps.Marker({
                position: locations[i].position,
                map: map,
                icon: {
                    url: url
                }
            });

            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                       //alert(locations[i].timestamp);
                    let time = new Date(locations[i].timestamp)
                   // time.setHours(time.getHours()+3);
                  //  alert(time)
                       seekTrack(time)
                    // infoWindow.setContent("<p><b>"+user+"</b></p>");
                    // infoWindow.open(map,marker);
                    // console.log('ddd')
                }
            })(marker, i));

            google.maps.event.addListener(marker, 'mouseover', (function (marker, i) {
                return function () {
                 //   alert(locations[i].timestamp);
                    infoWindow.setContent("<p><b>"+user+" :"+ new Date(locations[i].timestamp)+"</b></p>");
                    infoWindow.open(map,marker);
                    // console.log('ddd')
                }
            })(marker, i));
            marker.addListener("mouseout",function(){
                infoWindow.close();
            })
            if (locations[i + 1]) {
                let from = new google.maps.LatLng(locations[i].position);
                let to =  new google.maps.LatLng(locations[i + 1].position);
                var pathBetween = new google.maps.Polyline({
                    path: [from, to],
                    geodesic: true,
                    strokeColor: '#ececece',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                })
                pathBetween.setMap(map);
                bounds.extend(from);
                bounds.extend(to);
            }
        }
    }
    map.fitBounds(bounds);
}


async function populateUsersSelect(){
    const users = await getAllUsers();
    getUsers(users,'allusers');
}

async function getLocations(fromDate, toDate,selectedUser) {

    //const locations = post gotlocations...

    //we need to query the server with the same route to getLocationsByTime
    // send a post request with the fromdate todate

    const payload = {
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString()
    }
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }
    const urlFetch = selectedUser ? `http://localhost:3000/getLocationsByTimeAndUser/${selectedUser}` : 'http://localhost:3000/getLocationsByTime';
    const responseObj = await fetch(urlFetch, options);
    let locations = await responseObj.json();
    let user_map = new Map();

    locations.forEach((item) => {
        let location = {
            timestamp: item.timestamp,
            position: {
                altitude: item.position.altitude,
                lat: item.position.latitude,
                lng: item.position.longitude
            }
        }
        let collection = user_map.get(item.username);
        if (!collection) {
            user_map.set(item.username, [location]);
        } else {
            collection.push(location);
        }

    })
   // console.log(user_map);


    initMap(user_map);
  //  console.log(locations);
    /* const locations= [
        {timeStamp:1234,location:{lng: 35.217018,lat:31.771959}},
        {timeStamp:1232,location:{lng: 35.759590,lat:31.759590}},
        {timeStamp:1235,location:{lng: 35.205175,lat:31.759006}}
    ]
     */
    past()
}
var realTimeMap =null;
var timer1 = 0;
var isRealTime = false;
let markerArray = [];
let selectedUser='';
let mod = 0;
//this function call rekursively
function callRealTimeLocation(){
    // timer1 = setInterval(zzv,7000);
    if(isRealTime)
        timer1 =  setTimeout(getRealTimeLocation,7000);

}

//this funish the
function cancelRealTimeLocation(){
    // clearInterval(timer1);
    stop();
    isRealTime = false;
    clearTimeout(timer1);
    clearInterval(inter);

}

function getHistoryUser(){
    selectedUser = document.getElementById("allusers").value;
    if(selectedUser==='select'){
        return;
    }
    if(selectedUser==='all'){
        selectedUser=null;
    }
    getLocations(document.getElementsByName('fromDate')[0].value,
        document.getElementsByName('toDate')[0].value,selectedUser);

}

//123
function getRealTimeUser(){
    cancelRealTimeLocation();
    selectedUser = document.getElementById("users").value;
    //console.log(selectedUser)
    getRealTimeLocation();
}

function getUsers(users,id){

    let usersSelect =document.getElementById(id);

    usersSelect.innerHTML="";
    let option1 = document.createElement("option");
    let option2 = document.createElement("option");
    option1.value='select';
    option1.text='Select a user';
    option2.value='all';
    option2.text='All';
    usersSelect.add(option1);
    usersSelect.add(option2);
    users.forEach((user,index)=>{
        let option = document.createElement("option");
        option.value = user;
        option.text = user;
        usersSelect.add(option);
    });



}
//


async function getAllUsers(){
    const responseObj = await fetch('http://localhost:3000/getAllUsers/');
    const users = await responseObj.json();
    return users;

}

async function getRealTimeLocation(){


    const responseObj = await fetch('http://localhost:3000/getRealTimeLocation');
    let locations = await responseObj.json();
    let newlocations=[];
    const users = [];
    locations.forEach((location)=>{
        let newLocation= {
            timestamp:location.timestamp,position:{
                lat:location.position.latitude,lng:location.position.longitude
            }
        }
        if(selectedUser!="" && selectedUser!=="all"){
            if(selectedUser===location.username){
                newlocations.push(newLocation);
            }
        } else{
            newlocations.push(newLocation);
        }
        users.push(location.username);

    })
    if(!isRealTime){
        getUsers(users,'users');
    }


    if(realTimeMap==null) {
        realTimeMap = new google.maps.Map(document.getElementById("map-realtime"), {
            zoom: 4,
            center: newlocations[0].position // for now it center on the forst car....
        });
    }
    //delete all markers first
    markerArray.forEach((marker)=>{
        marker.setMap(null);
    })
    newlocations.forEach((newLocation)=> {

        var marker = new google.maps.Marker({
            position: newLocation.position,
            map: realTimeMap
        });
        markerArray.push(marker);

    });
    isRealTime = true;
    callRealTimeLocation();

    /*locations = locations.map((item)=>{
        return {
            timestamp: item.timestamp,
            position:{
                altitude:item.position.altitude,
                lat:item.position.latitude,
                lng:item.position.longitude
            }
        }

    })*/


return users;
//    akiva needs the return
}

let m = 0;
let socket_initiated = false;
let old_off;
function start() {
    console.log("i am here")
    stop();
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    offset = 0
    old_off = offset;
    console.log("supposed to be ehe")
    // audioCtx.resume();
    channels = 1;
    var sounds = {};
    socket = io('http://localhost:3002')
    socket_initiated = true;
    socket.on('message', (msg) => {
        got(msg)
    });

    stop();

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    offset = 0
    // audioCtx.resume();
    channels = 1;
    var sounds = {};
    let user = selectedUser//document.getElementById("forNow").value;
    socket = io(`http://localhost:3002/?user=${user}`)
    socket_initiated = true;

    inter = setInterval(xxx, 3000);

    //send ajax with user, the server will hold a dict for each io and its user and if
    // incoming datagram matches that ios user then broadcast it.
    socket.on('message', (msg) => {
        got(msg)
    });
}

function stop(){
    if(socket_initiated) {
        socket.close();
        socket_initiated = false;
    }
    clearInterval(inter)
}

function xxx(){


    if(offset - old_off < 0.5)
    {
        console.log("no audio..")
        stop();
        start();
    }
    console.log("off - off= ", offset-old_off);
    old_off = offset;

    // else
    // {
    //     setTimeout(xxx, 3000, offset);
    // }
}

function past(){
    audioSource = false;
    audioGaps = [];
    console.log("should I be here??")
    stop();
    //document.getElementById("past_audio").src = "";
    // video.pause()
    // video.currentTime(0)
    // video.src(null)
    // video.reset()
    document.getElementById("vidjs").innerHTML = "";
    let from = document.getElementsByName('fromDate')[0].value;
    let until = document.getElementsByName('toDate')[0].value;

    if(controller)
        controller.abort();

    controller = new AbortController();
    const signal = controller.signal;

    //controller = new AbortController();
    //const { sig } = controller;
   // video.pause();
    //video.src(null);

    var user = document.getElementById("allusers").value;//selectedUser//document.getElementById("forNow").value;
    fetch(`/past?from=${from}&until=${until}&user=${user}&window=${windowID}`,
         { signal })
        .then(status)
        .then((response)=> {return response.json()})
        .then(function(response) {
           // audioGaps = [];
            console.log(response)

            document.getElementById("vidjs").innerHTML = "<audio class=\"video-js vjs-default-skin\" controls=\"\" data-setup='{\"width\": 640, \"height\": 0}' height=\"0\" id=" + `vidjs${m}` + " preload=\"\" width=\"640\">\n" +
                "<source src=null type='audio/wav'>" +
                "</audio>";
            // video.src(null)
            // video.reset()
             video = videojs(`vidjs${m}`, {}, function () {
                 audioSource = true;

                 video.reset();
                video.src({ type: "audio/wav", src: `http://localhost:3000/clip/${m}/?window=${windowID}` });
                audioGaps = response;
                //load markers
                 let gaps = [];
                 for(let i of Object.keys(response))
                 {
                     let time = new Date(response[i])
                     time.setHours(time.getHours()-3);

                     gaps.push({time: i, text: time})
                 }
                video.markers({
                    markers: gaps
                });

                console.log('Request succeeded with JSON response', response);
                //video.src({ type: "audio/wav", src: `` });

                //video.src(`http://localhost:3000/clip/${m}/?window=${windowID}`)
                // document.getElementById("past_audio").src = ""
                //document.getElementById("past_audio").src = `http://localhost:3000/clip/${m}/?window=${windowID}`;
                m++;


                getPastSpeechToText();


            });


        }).catch(function(error) {
        console.log('Request failed', error);
        if(error.name === "AbortError") {
            console.log("aborted")
        }
    });

   // console.log(document.getElementById("past_audio").src);
}

window.addEventListener('DOMContentLoaded', (event) => {
    var audioCtx;// = new (window.AudioContext || window.webkitAudioContext)();
    var channels;// = 1;
    var offset;// = 0;
    var socket;
    //var video = videojs('past_audio');
   // video = videojs('past_audio');
    window.name = Math.random();
    document.getElementById("get-real-time").addEventListener("click", start);

    document.getElementById("notify-user-list").addEventListener("submit", function (event) {
        event.preventDefault();
        let users_to_notify = document.getElementsByName('notify-opt');
        users_to_notify.forEach((opt)=>{
            if(opt.checked)
                speechToTextLive(true, opt.value)
        })

    });
    //-------------
    // // load video object
    // var video = videojs('example_video_1');
    //
    // //load markers
    // video.markers({
    //     markers: [
    //         {time: 9.5, text: "this"},
    //         {time: 16,  text: "is"},
    //         {time: 23.6,text: "so"},
    //         {time: 28,  text: "cool"}
    //     ]
    // });
    // //--------------

});


window.addEventListener('beforeunload', function(e) {
    //var myPageIsDirty = ...; //you implement this logic...
    //if(myPageIsDirty) {
        //following two lines will cause the browser to ask the user if they
        //want to leave. The text of this dialog is controlled by the browser.
     //   e.preventDefault(); //per the standard
    fetch(`http://localhost:3000/delete?window=${windowID}`);

    e.returnValue = ''; //required for Chrome
  //  }
    //fetch('http://localhost:3000/delete');
    //else: user is allowed to leave without a warning dialog
});
function got(msg)
{

    var arr = new Int8Array( msg); //# fill the byte array
    var myAudioBuffer = audioCtx.createBuffer(channels, arr.length/2, 46875);
    for (var channel = 0; channel < channels; channel++) {

        var nowBuffering = myAudioBuffer.getChannelData(channel);
        for (var i = 0; i < arr.length/2; i++) {
            // audio needs to be in [-1.0; 1.0]
            // for this reason I also tried to divide it by 32767
            // as my pcm sample is in 16-Bit. It plays still the
            // same creepy sound less noisy.
            var word = (arr[i * 2] & 0xff) + ((arr[i * 2 + 1] & 0xff) << 8);
            nowBuffering[i] = ((word + 32768) % 65536 - 32768) / 32768.0;
        }
    }
    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    //playSound(myAudioBuffer)
    // if(j==0) {
    j = 1;

    playSound(myAudioBuffer)


}

function playSound(buffer) {
    var source = audioCtx.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(audioCtx.destination);       // connect the source to the context's destination (the speakers)
    source.start(offset);
    // play the source now
    // note: on older systems, may have to use deprecated noteOn(time);

    offset += buffer.duration;
    console.log(offset)
}


//put message waiting for broadcats of audio!!
function speechToTextLive(withoutTranscipt, speaker_param) {
    let speaker;
    if(!withoutTranscipt)
        speaker = selectedUser;
    else
        speaker = speaker_param;

    speechToTextSocket = io(`http://localhost:3002/?speaker=${speaker}`)
    speechToTextSocket.on('message', (msg) => {

        let speakerCount = msg.speakerCount;

        if(withoutTranscipt) {
            if(speakerCount) {
                alert(`${speaker} is speaking!!!`)
                speechToTextSocket.close();
            }
            //return;
        }
        let div = document.getElementById("live-speech-to-text-results");

        let output;

        function restartRequest() {
            speechToTextSocket.close();
            speechToTextLive();
        }

        if(speakerCount === -1) {
            output = "Audio transmission from the user was interrupted, trying again...";
            restartRequest();
        }
        else if(speakerCount === -2) {
            output = "An error occurred with Googles API, trying again...";
            restartRequest();
        }
        else if(speakerCount === -3) {
            output = "Request timed out after 5 min, restarting..."
            restartRequest();
        }

        else
            output = `Estimated live speaker count: ${msg.speakerCount}\n\n`;

        let transcript = msg.transcript;
        if(transcript)
            output += `${transcript}`;

        if(!withoutTranscipt)
            div.innerHTML = output;

    });
}

let selectedSpeechToText = false;
function selectSpeechToText() {
    selectedSpeechToText = true;
}


//ADD OPTION FOR NO WORDS AT ALL!
function displayPastSpeechToTextResults(data) {
    let div = document.getElementById("past-speech-to-text-results");
    let output = "";
    output += `Estimated number of speakers: ${data.speakerCount}\n\nTranscript:`;
    let ind = 0;
    let speakerTag = -1;
    for(let word of data.transcript) {
        ind++;
        if(ind%10==1) {
            let millis = parseInt(word[0]) * 1000
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);

            output +=  `<br>${minutes + ":" + (seconds < 10 ? '0' : '') + seconds}:`;
        }
            if(speakerTag!==word[1]) {
                output+= `<br>Speaker: ${word[1]}<br>`;
                    speakerTag = word[1];
            }
            output+= `${word[2]} `;

        // for (let word of words[1]) {
        //     output += `${word[1]}: ${word[0]}! `
        // }
    }
    div.innerHTML = output;

}

function getPastSpeechToText() {
    if(selectedSpeechToText) {

        if(speechController)
            speechController.abort();

        speechController = new AbortController();
        const signalSpeech = controller.signal;
        console.log("made it o ?")
        fetch(`http://localhost:3000/speechToTextPast?window=${windowID}`,
            { signalSpeech })
            .then(status)
            .then((response)=> {return response.json()})
            .then(function(response) {
                displayPastSpeechToTextResults(response);
                console.log(response)
            }).catch(function(error) {
            console.log('Request failed', error);
            if(error.name === "AbortError") {
                console.log("aborted google")
            }
        });
    }
}


function notifySpeakers() {
    getRealTimeLocation().then(function (users) {
        let div = document.getElementById("notify-user-list");
        let html = `<div class = 'form-check'>`;
        users.forEach((user)=>{
            html+=`
            <div class="checkbox">
                <label><input type="checkbox" name='notify-opt' value="${user}" checked>${user}</label>
            </div>`;
        })
        html += `<button type="submit" onclick="" class="btn btn-primary">Enter</button></div>`

        div.innerHTML = html;
    });

}


function seekTrack(time){
    time = new Date(time)
    console.log("at start audiogaps is " , audioGaps)
    console.log("time to move to is: ", time)
    if(audioSource) {
        let keys = Object.keys(audioGaps)

        for(let i = 0; i < keys.length; i++) {
            console.log("about to see if time is bigger than audiGaps[i]")
            let gapTime = new Date(audioGaps[keys[i]])
            gapTime.setHours(gapTime.getHours() - 3)
            console.log(time, " ", (gapTime))

            if (time > (gapTime)) {
                console.log("true!")
                if(i+1!=keys.length) {
                    let nextT = audioGaps[keys[i + 1]]
                    if (nextT) {
                        let t = new Date(audioGaps[nextT]);
                        t.setHours(t.getHours() - 3)
                        let seekTime = (parseInt(keys[i]) + ((time - gapTime)/1000));

                        if (seekTime < t) {
                            if(seekTime > video.duration()) {
                                alert("not in there!")
                                return
                            }
                            video.currentTime(seekTime)
                            console.log("seeked 1")
                            return;
                        }
                    }
                }
                    else
                    {
                        let seekTime = (parseInt(keys[i]) + ((time - gapTime)/1000));
                        console.log(keys[i], " ", time, " ", gapTime);
                        console.log(seekTime)
                        if(seekTime > video.duration()) {
                            alert("not in there!")
                            return
                        }
                        video.currentTime(seekTime)
                        console.log("seeked 2")
                        return;

                    }
                }
            }

        }




}