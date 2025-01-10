const express = require('express');
const cors = require('cors');
const { PeerServer } = require('peer');
const http = require('http');

const app = express();
const port = process.env.PORT || 3000;
const peerPort = process.env.PEER_PORT || 3009;

let waitingRoom = [];

app.use(cors({
  origin: ['http://localhost:3000', 'https://goatchat.onrender.com', 'https://wir.tde.mybluehost.me'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.static('public'));

// Add a user to the waiting room
app.post('/add-to-waiting-room', (req, res) => {
  const peerId = req.body.peerId;
  if (!peerId) {
    return res.status(400).json({ error: 'Peer ID is required' });
  }

  console.log(`User ${peerId} added to waiting room`);
  waitingRoom.push(peerId);
  res.json({ message: 'User added to waiting room' });
});

// Match two peers from the waiting room
app.get('/match-peers', (req, res) => {
  if (waitingRoom.length >= 2) {
    const peer1 = waitingRoom.shift();
    const peer2 = waitingRoom.shift();
    console.log(`Matched peers: ${peer1} and ${peer2}`);
    res.json({ peer1, peer2 });
  } else {
    res.json({ message: 'Waiting for another peer...' });
  }
});

// Notify the other peer to skip
app.post('/notify-skip', (req, res) => {
  const peerId = req.body.peerId;
  console.log(`Notifying peer ${peerId} to skip the call`);
  res.json({ message: 'Peer notified to skip' });
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Main server running on port ${port}`);
});

const peerServer = PeerServer({
  port: peerPort,
  path: '/peerjs',
  host: '0.0.0.0',
  allow_discovery: true,
  debug: true,
});

/*peerServer.listen(peerPort, () => {
  console.log(`PeerJS server running on port ${peerPort}`);
});
*/


