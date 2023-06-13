
console.log('hello world');

var app = {
    submitBtn: document.getElementById('submitBtn'),
    recordBtn: document.getElementById('recordBtn'),
    input: document.getElementById('input'),
    stopBtn: document.getElementById('stopBtn'),
    currentMessage: null,
    audioChunks: [],
    mediaRecorder: null,
    init: function() {
        console.log('app init');
        app.submitBtn.addEventListener('click', app.click);
        app.recordBtn.addEventListener('click', app.record);
        app.stopBtn.addEventListener('click', app.stopRecording);
        app.main();
    },
    
    main: function() {
        console.log('app main');
    },

    click: function() {
        console.log('app click');
        var message = app.input.value;
        if(message === '') {
            // empty message
            return;
        } else {
            //app.sendMessage(message);
            this.currentMessage = message;
            app.sendMessage(this.currentMessage);
            console.log(message);
        }
        app.input.value = '';
    },
    sendMessage: function(message) {
        var data = {
            message: message
        };
        fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            console.log(data);
            app.receiveMessage(data);
        });
    },
    
    receiveMessage: function(message) {
        console.log(message.message.content);
        let messageContent = message.message.content;
        var messageBox = document.getElementById('message-box');
        var messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = messageContent;
        messageBox.appendChild(messageElement);

        // synth voice
        app.speech2text(messageContent);
    },

    speech2text: function(message) {
        var myHeaders = new Headers();
        myHeaders.append("xi-api-key", "40dc5ac7de510a1eb0f100422a2c0f36");
        myHeaders.append("accept", "audio/mpeg");
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
        "text": message,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
        });

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
        };

        fetch("https://api.elevenlabs.io/v1/text-to-speech/MF3mGyEYCl7XYWbV9V6O", requestOptions)
        .then(response => response.blob())
        .then(blob => {
            app.playAudio(blob);
        })
        .catch(error => console.log('error', error));
    },


    playAudio: function(blob) {

        var url = URL.createObjectURL(blob);
        var audio = document.createElement('audio');
        audio.style.display = "block";
        audio.src = url;
        audio.controls = true;
        var messageBox = document.getElementById('message-box');
        messageBox.appendChild(audio);
        audio.play();
    },

    record: function() {
        // write code to record audio from html and save to file
        console.log('record');

        window.navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => { 
            
            app.mediaRecorder = new MediaRecorder(stream);
            
            app.mediaRecorder.start();

            app.audioChunks = [];
            
            app.mediaRecorder.addEventListener("dataavailable", event => {
                app.audioChunks.push(event.data);
            });
            
        });

    },

    stopRecording: function() {
        // stop recording
        console.log('stop recording');

        app.mediaRecorder.stop();
        
        app.mediaRecorder.addEventListener("stop", () => {
            console.log('stop event fired')

            const audioBlob = new Blob(app.audioChunks, {
                type: 'audio/wav'
            });

            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();

            // empty audio chunks
            app.audioChunks = [];

            // send audio to server
            app.sendAudio(audioBlob);

        });

    },
    
    sendAudio: function(audioBlob) {
        // send audio to server
        console.log('send audio');

        // create FormData to send to the server
        let fd = new FormData();
        fd.append('audio', audioBlob, 'audio.wav');

        // send Blob to server via Fetch API
        fetch('/upload', {
            method: 'POST',
            body: fd
        });

    }

};

window.onload = app.init;