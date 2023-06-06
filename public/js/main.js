console.log('hello world');

var app = {
    button: document.getElementById('submit'),
    input: document.getElementById('input'),
    currentMessage: null,
    init: function() {
        console.log('app init');
        app.button.addEventListener('click', app.click);

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
    }
};

window.onload = app.init;