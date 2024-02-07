const crypto = require("crypto");
const ws = require("ws");

const connections = {};
// users is an index of the connections belonging to a user. {user1: ["conn1", "conn3", etc...]}
const users = {};

const listeners = {};

const connectionCloseCallbacks = [];

function getActiveConnections() {
  return Object.values(connections)
    .map((user) => Object.keys(user))
    .flat(3);
}
function createWebsocket(server, path = "/ws") {
  const wss = new ws.Server({ noServer: true });
  wss.on("connection", (socket, request) => {
    //original validation props
    const { connId } = request;

    connections[connId] = socket;
    socket.on("message", (message, isBinary) => {
      if (isBinary) {
        return; // TODO:handle binary messages
      }
      handleIncomingMessage(message.toString(), connId);
    });
    socket.on("close", () => {
      connectionCloseCallbacks.forEach((func) => {
        func(connId);
      });
      delete connections[connId];
      for (const user of Object.keys(users)) {
        users[user].delete(connId);
      }
    });
  });

  server.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.headers.origin + request.url);
      if (url.pathname !== path) {
        throw new Error("can't connect to ws at that route");
      }

      const connId = crypto.randomUUID();
      request.connId = connId;
      wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit("connection", socket, request);
      });
    } catch (error) {
      console.error(error);
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  });
}

// register a callback with this signature function(connId, userId)
function onConnectionClose(func) {
  if (typeof func == "function") {
    connectionCloseCallbacks.push(func);
  }
}

function emitToConnection(connId, event, data) {
  try {
    if (!connections[connId]) {
      return {};
    }
    const conn = connections[connId];
    if (conn?.send) {
      conn.send(JSON.stringify({ event, data }));
    }
    return {};
  } catch (error) {
    return { error };
  }
}

function emitToUser(userId, event, data) {
  try {
    if (!users[userId]) return {}; // no conns for this user
    const ids = users[userId];
    for (const connId of ids) {
      const conn = connections[connId];
      if (conn?.send) {
        conn.send(JSON.stringify({ event, data }));
      }
    }
    return {};
  } catch (error) {
    return { error };
  }
}
function emitToUsers(ids = [], event, data) {
  try {
    for (const userId of ids) {
      if (!users[userId]) continue; // no conns for this user
      const ids = users[userId];
      for (const connId of ids) {
        const conn = connections[connId];
        if (conn?.send) {
          conn.send(JSON.stringify({ event, data }));
        }
      }
    }
    return {};
  } catch (error) {
    return { error };
  }
}

function emit(event, data) {
  try {
    Object.values(connections).forEach((conn) => {
      if (conn?.send) {
        conn.send(JSON.stringify({ event, data }));
      }
    });
    return {};
  } catch (error) {
    return { error };
  }
}

function addEventListener(event, func) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  if (typeof func == "function") {
    const exists = listeners[event].find((f) => f == func);
    if (!exists) {
      listeners[event].push(func);
    }
  }
}
function removeEventListener(event, func) {
  if (listeners[event]) {
    listeners[event] = listeners[event].filter((f) => f != func);
  }
}

//TODO: no need to receive incoming messages for now.
function handleIncomingMessage(message, connId) {
  try {
    const { event, data } = JSON.parse(message);
    if (listeners[event]) {
      for (const func of listeners[event]) {
        func(data, connId);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function registerUser(userId, connId) {
  if (!users[userId]) {
    users[userId] = new Set();
  }
  users[userId].add(connId);
}

function removeUser(connId) {
  for (const user of Object.keys(users)) {
    users[user].delete(connId);
  }
}


module.exports = {
  createWebsocket,
  emitToUser,
  emitToUsers,
  emit,
  emitToConnection,
  onConnectionClose,
  getActiveConnections,
  addEventListener,
  removeEventListener,
  registerUser,
  removeUser,
};
