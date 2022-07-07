//////////////////////////////////////////////////////////////////////////////
//                              Web Socket Test 01                          //
//////////////////////////////////////////////////////////////////////////////

// Library imports
import { WebSocketServer } from 'ws';
import express from 'express';

const userNames = ['David', 'Roger', 'Anna', 'Sophie', 'Howard', 'Lucy', 'Peter', 'Stella', 'Michael', 'Elizabeth'];
const userColors = ['purple', 'Chocolate', 'green', 'DeepPink', 'LightCoral', 'purple', 'Chocolate', 'green', 'DeepPink', 'LightCoral'];
let nextUser = 0;


////////////////////////////////////////////
// Initialize and manage websocket server //
////////////////////////////////////////////

const wss = new WebSocketServer({ port: 8080 });

// Create connection using websocket
wss.on("connection", ws => {
    ws.userName = userNames[nextUser];
    ws.userColor = userColors[nextUser];

    console.log(`new client named ${ ws.userName } connected.`);
    nextUser = (nextUser == userNames.length - 1) ? 0 : nextUser + 1;

    // Tell all clients about this new user
    wss.clients.forEach(cli => {
        cli.readyState == 1 &&
        cli.send( JSON.stringify({ type: "joined", user: ws.userName }) );
    });
    
    // receiving a message
    ws.on("message", data => {
        serverReceive(ws, data);
    });

    // handling what to do when client disconnects from server
    ws.on("close", () => {
        console.log("the client has disconnected");
        wss.clients.forEach(cli => {
            cli.readyState == 1 &&
            cli.send( JSON.stringify({ type: "left", user: ws.userName }) );
        });
    });

    // handling client connection error
    ws.onerror = () => {
        console.log("Some Error occurred");
    }
});
console.log("The WebSocket server is running on port 8080");


///////////////////////////////////////////
// Initialize Express and handle routing //
///////////////////////////////////////////

const app = express();
const port = 3000;

// EJS templates
app.set('view engine', 'ejs');
app.set('views', 'views');

// home page route (incorrect usage)
app.get('/', (req, res) => {
    res.render('page', { username: userNames[nextUser] });
});

// static assets
app.use(express.static('static'));

// 404 error when nothing else has managed to process the URL
app.use((req, res) => {
    res.status(404).send('404: Not found!');
});

app.listen(port, () => {
    console.log("Websocket test 01 app server running at localhost:3000");
});

//////////////////////////
// Handle communication //
//////////////////////////

// Manage received from a client
function serverReceive(client, data) {
    const msg = JSON.parse(data)

    switch (msg.type) {
        case "message":   // A user has typed a message
            // Tell all clients
            wss.clients.forEach(cli => {
                cli.readyState == 1 &&
                cli.send( JSON.stringify({ type: 'message', contents: msg.contents, user: client.userName, color: client.userColor }) );
            });
            break;

        case "buzz":
            wss.clients.forEach(cli => {
                cli.readyState == 1 &&
                cli.send( JSON.stringify({ type: 'buzz', user: client.userName, color: client.userColor }) );
            });
            break;

        case "rollcall":
            let names = ""
            wss.clients.forEach(cli => {
                if (names != "") names += ', ';
                names += cli.userName;
            });
            client.send( JSON.stringify({ type: 'rollcall', contents: names }) );
            break;
            
        default:
            console.log("WARNING: Invalid message received from client!");            
    }
}
