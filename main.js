const WebSocket = require('ws');

var idNumber = 1;

var numberOfRooms = 30; // one creator per room
var numberOfClientsPerRoom = 8; // numero sin incluir al creator
var clients = [];

class WebSocketClient {
    constructor(
        roomId = "",
        toggle = true

    ) {
        this.roomId = roomId;
        this.idNumber = idNumber;
        idNumber++;
        console.log("created client with id:", this.idNumber)

        const host = "https://planpoker.fly.dev";
        this.ws = new WebSocket(`${host}/ws?name=NewPlaya`);

        this.ws.addEventListener('open', this.onOpen.bind(this));
        this.ws.addEventListener('message', (event) => { this.handleNewMessage(event) });
        this.ws.addEventListener('close', this.onClose.bind(this));
        this.ws.addEventListener('error', this.onError.bind(this));

        this.startMessaging();
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
            const message = {
                action: 'update-points',
                msg: this.toggle ? '1' : '3'
            };

            this.toggle = !this.toggle

            console.log('Sending message from client with id: ', this.idNumber, "with contento", message);

            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(message));
                // console.log('Sent message: ', message);
            } else {
                console.log('WebSocket not open YET');
            }

        }, 10000);
    }

    onError(e) {
        // console.error('WebSocket error:', e);
        console.error('WebSocket error');
    }

    close() {
        this.ws.close();
    }

    handleNewMessage(e) {
        if (e.data === undefined) {
            console.log("undefined found");
        }

        try {
            JSON.parse(e.data);
        } catch (error) {
            // console.error('ERROR', error);
            // console.error(e.data)
            return
        }

        const message = JSON.parse(e.data);

        switch (message.status) {
            case "join-room":
                this.handleOkMessage(message);
                break;
            case "create-room":
                console.log("create-room message received on client id", this.idNumber)
                this.roomId = message.id;

                for (let i = 0; i < numberOfClientsPerRoom; i++) {
                    setTimeout(() => {
                        console.log("creating new user", idNumber, "from user", this.idNumber, "for room", message.id)
                        const wsClient = new WebSocketClient(message.id);
                        clients.push(wsClient);
                    }, 2000)
                }

                this.handleOkMessage(message)
                break;
            case "reset-room":
                this.setPick("0");
                this.handleOkMessage(message);
                break;
            case "ok":
                // console.log("ok message received from client", this.idNumber);
                this.handleOkMessage(message);
                break;
            case "error":
                this.handleErrorMessage(message);
                break;
            default:
                break;
        }
    }

    handleOkMessage(event) {
        // console.log('Ok message received');
        // this.startMessaging();
    }

    handleErrorMessage(message) {
        console.log('Error message received:', message.msg);
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

// Create the rooms
for (let i = 0; i < numberOfRooms; i++) {
    setTimeout(() => {
        console.log("creating new creator user")
        const newClient = new WebSocketClient("");
        clients.push(newClient);
    }, 3000)
}

setInterval(() => console.info("===========total number of users", clients.length), 3000)
setInterval(() => {
    console.info(
        "===============total number of connected users",
        clients.filter(x => x.ws.readyState === WebSocket.OPEN).length)
},
    3000
)