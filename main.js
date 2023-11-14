
// Define the target WebSocket endpoint
const wsEndpoint = 'wss://localhost/ws';

// Function to create a new WebSocket client and send messages every second
function createClientInRoomAndSendMessages() {
    // Create a new WebSocket client
    const wsClient = new WebSocket(wsEndpoint);

    // Open connection event
    wsClient.onopen = function () {
        console.log('Connection opened for: ', wsClient);

        // Send a message every second
        setInterval(() => {
            const message = { action: 'update-card', msg: '1' };
            wsClient.send(JSON.stringify(message));
            console.log('Sent message: ', message);
        }, 1000);
    };

    // Handle messages from the server
    wsClient.onmessage = function (event) {
        console.log('Received message: ', event.data);
    };

    // Handle any errors that occur
    wsClient.onerror = function (error) {
        console.error('WebSocket Error: ', error);
    };

    // Handle the WebSocket closing
    wsClient.onclose = function () {
        console.log('WebSocket connection closed');
    };
}

// Specify the number of WebSocket clients you want to create
const numberOfClients = 10;

// Create multiple WebSocket clients
for (let i = 0; i < numberOfClients; i++) {
    createClientAndSendMessages();
}








export class WebSocketClient {
    ws;
    idNumber;
    roomId;
    serverUrl = "https://scrumpoker.fly.io";

    constructor(
        idNumber,
        roomId = "",
    ) {
        this.roomId = roomId;
        this.ws.addEventListener('open', this.onOpen.bind(this));
        this.ws.addEventListener('message', (event) => { this.handleNewMessage(event) });
        this.ws.addEventListener('close', this.onClose.bind(this));
        this.ws.addEventListener('error', this.onError.bind(this));
    }

    onOpen() { // e: Event
        console.log('Connection opened for: ', wsClient);

        if (this.roomId !== "") {
            this.joinRoom(this.roomId)
        }

        // Send a message every second
        setInterval(() => {
            console.log('Sending message from client: ', this.idNumber);
            let toggle = true

            const message = {
                action: 'update-card',
                msg: toggle ? '1' : '3'
            };

            toggle = !toggle
            wsClient.send(JSON.stringify(message));
            console.log('Sent message: ', message);
        }, 1000);

    }

    onClose(e) {
        if (e.wasClean) {
            console.log(`WebSocket connection closed cleanly, code=${e.code}, reason=${e.reason}`);
        } else {
            console.error('WebSocket connection abruptly closed');
        }
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

for (let i = 0; i < 1000; i++) {
    const wsClient = new wsClient();

}