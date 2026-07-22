"use strict";
const { WebSocketServer } = require('ws');
const Y = require('yjs');

const port = 3002;
const docs = new Map();

const wss = new WebSocketServer({ port });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', 'http://localhost');
  const docName = url.pathname.slice(1); 
  if (!docName) return ws.close();

  let doc = docs.get(docName);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(docName, doc);
  }

  // 1. Send initial state as a raw Buffer
  const state = Y.encodeStateAsUpdate(doc);
  ws.send(Buffer.from(state));

  ws.on('message', (message) => {
    try {
      const update = new Uint8Array(message);
      
      // 2. Apply to server doc
      Y.applyUpdate(doc, update);

      // 3. Broadcast raw Buffer to others
      const broadcastMsg = Buffer.from(update);
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(broadcastMsg);
        }
      });
    } catch (e) {
      // ONLY log actual sync errors, ignore module loading errors
      if (e.message !== 'Unexpected end of array') {
        console.error('Sync error:', e);
      }
    }
  });
});

console.log(`🟢 Yjs WebSocket server running on ws://localhost:${port}`);