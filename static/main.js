
// Initialize the client's socket and connect to the websocket
const socket = new WebSocket("ws://localhost:8080");
socket.addEventListener("open", () =>{
    // Connection has just opened!
    console.log("[Connection established]");
});

socket.addEventListener('message', e => {
    // Recevied a message from the websocket
    const data = JSON.parse(e.data);
    const el = document.createElement('div');

    switch (data.type) {
        case "joined":   // New user has joined the chat
            el.style = "color: red";
            el.innerText = `[${ data.user } has joined the chat!]`;
            document.getElementById('chat').appendChild(el);
            break;

        case "buzz":   // Buzzer!
            el.style = "color: " + data.color;
            el.innerText = `*** ${ data.user } just buzzed y'all! ***`;
            document.getElementById('chat').appendChild(el);
            break;

        case "left":   // user left
            el.style = "color: red";
            el.innerText = `[${ data.user } left the room!]`;
            document.getElementById('chat').appendChild(el);
            break;

        case "message":     // Someone has typed something!
            const
                el_name = document.createElement('span'),
                el_msg = document.createElement('span');
            el_name.style = "color: " + data.color;
            el_name.innerText = data.user + ': ';
            el_msg.innerText = data.contents;

            document.getElementById('chat').appendChild(el_name);
            document.getElementById('chat').appendChild(el_msg);
            document.getElementById('chat').appendChild(document.createElement("br"));
            break;

        case "rollcall":    // Show us a list of the users present!
            el.style = "color: gray";
            el.innerText = `< People present: ${ data.contents } >`;
            document.getElementById('chat').appendChild(el);
            break;

        default:
            console.log("WARNING: Invalid message received from server!");    
    }
    ScrollDown();
});

// Send message by pressing ENTER
document.getElementById('msg').addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("send_button").click();
    }
});

// Send button click event
document.getElementById('send_button').onclick = function() {
    const newMsg = document.getElementById('msg').value;
    socket.send( JSON.stringify({ type: "message", contents: newMsg }) );
    document.getElementById('msg').value = '';
    document.getElementById('msg').focus();
}

// Buzz button click event
document.getElementById('buzz_button').onclick = function() {
    socket.send( JSON.stringify({ type: 'buzz' }) );
    document.getElementById('msg').focus();
}

// Roll call (who's present?) button click event
document.getElementById('rollcall').onclick = function() {
    socket.send( JSON.stringify({ type: 'rollcall' }) );
    document.getElementById('msg').focus();
}

// Scroll all the way down so the buttons are visible
function ScrollDown() {
    document.getElementById('send_button').scrollIntoView();
}
