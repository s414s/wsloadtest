const WebSocket = require('ws');

var idNumber = 1;

class WebSocketClient {
    // ws;
    // idNumber;
    // roomId;

    constructor(
        roomId = "",
    ) {
        this.roomId = roomId;
        this.idNumber = idNumber;
        idNumber++;
        console.log("created client with id:", this.idNumber)

        this.ws = new WebSocket("https://scrumpoker.fly.dev/ws?name=NewPlaya");
        this.ws.addEventListener('open', this.onOpen.bind(this));
        this.ws.addEventListener('message', (event) => { this.handleNewMessage(event) });
        this.ws.addEventListener('close', this.onClose.bind(this));
        this.ws.addEventListener('error', this.onError.bind(this));
    }

    onOpen() { // e: Event
        console.log('Connection opened for client with Id: ', this.idNumber);

        if (this.roomId === "") {
            this.sendMessage({ action: "create-room" })
        } else {
            this.joinRoom(this.roomId)
        }

    }

    onClose(e) {
        if (e.wasClean) {
            console.log(`WebSocket connection closed cleanly, code=${e.code}, reason=${e.reason}`);
        } else {
            console.error('WebSocket connection abruptly closed');
        }
    }

    startMessaging() {
        // Send a message every second
        setInterval(() => {
            console.log('Sending message from client: ', this.idNumber);
            let toggle = true

            const message = {
                action: 'update-card',
                msg: toggle ? '1' : '3'
            };

            toggle = !toggle
            this.ws.send(JSON.stringify(message));
            console.log('Sent message: ', message);
        }, 1000);
    }

    onError(e) {
        console.error('WebSocket error:', e);
    }

    close() {
        this.ws.close();
    }

    handleNewMessage(e) {
        console.log('WebSocket message received on client ', this.idNumber);
        const message = JSON.parse(e.data);

        switch (message.status) {
            case Code.JoinRoomAction:
                this.handleOkMessage(message);
                break;
            case Code.CreateRoomAction:
                this.roomId = message.msg;
                console.log("room created with id", message.msg)
                this.handleOkMessage(message)
                break;
            case Code.ResetRoomAction:
                this.setPick("0");
                this.handleOkMessage(message);
                break;
            case Code.OkCode:
                this.handleOkMessage(message);
                break;
            case Code.ErrorCode:
                this.handleErrorMessage(event);
                break;
            default:
                break;
        }
    }

    handleOkMessage(event) {
        console.log('Ok message received:');
    }

    handleErrorMessage(event) {
        console.log('Error message received:', event.msg);
    }

    sendMessage(msg) {
        if (this.ws.readyState !== WebSocket.OPEN) {
            console.log('websocket connection is not open');
            return
        }

        if (msg.action) {
            this.ws.send(JSON.stringify(msg));
            return
        }
    }

    joinRoom(roomId) {
        this.sendMessage({ action: "join-room", msg: roomId });
    }

}

const numberOfRooms = 100;
const numberOfClientsPerRoom = 10;
const clients = [];

// Create the rooms
for (let i = 0; i < numberOfRooms; i++) {
    setTimeout(() => {
        const newClient = new WebSocketClient("");
        clients.push(newClient);
    }, 1000)
}

// Start the game and add the rest of the players
clients.forEach(x => {
    setTimeout(() => {
        x.sendMessage({ action: "reset-room" })

        const roomId = x.roomId;
        for (let i = 0; i < numberOfClientsPerRoom; i++) {
            setTimeout(() => {
                const wsClient = new WebSocketClient(roomId);
                clients.push(wsClient);
            }, 300)
        }
    }, 200)
})

// Start sending messages
clients.forEach(x => { x.sendMessage() })

while (true) {
    setInterval(() => console.info("waiting"), 1000)
}