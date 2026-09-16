import http from "http";
import { WebSocketServer } from "ws";
import express from "express";
import type { WebSocket } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface userSocket extends WebSocket {
  userId?: string;
  roomId?: string;
}

// roomId -> array of ws connections
const rooms = new Map<string, userSocket[]>();

wss.on("connection", (ws: userSocket) => {
  ws.on("error", console.error);

  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());

    if (data.type === "join_room") {
      ws.roomId = data.roomId;
      ws.userId = data.userId;

      if (!rooms.has(data.roomId)) {
        rooms.set(data.roomId, []);
      }
      const existingUsers = rooms.get(data.roomId)!;
      // tell the new joiner who's already here
      ws.send(
        JSON.stringify({
          type: "existing_users",
          users: existingUsers.map((s) => s.userId),
        }),
      );
      // tell everyone else in the room that someone new joined
      broadcastToRoom(
        data.roomId,
        {
          type: "user_joined",
          userId: data.userId,
        },
        ws,
      );
      rooms.get(data.roomId)?.push(ws);
    }

    if (data.type === "signal") {
      const sockets = rooms.get(ws.roomId!) || [];

      if (data.to) {
        const target = sockets.find((s) => s.userId === data.to);
        target!.send(
          JSON.stringify({
            type: "signal",
            from: ws.userId,
            to: data.to,
            signalType: data.signalType,
            payload: data.payload,
          }),
        );
      } else {
        // forward WebRTC offer/answer/ICE candidates to everyone else in room
        broadcastToRoom(
          ws.roomId!,
          {
            type: "signal",
            from: ws.userId,
            signalType: data.signalType,
            payload: data.payload,
          },
          ws,
        );
      }
    }

    if (data.type === "chat") {
      broadcastToRoom(
        ws.roomId!,
        {
          type: "text",
          from: ws.userId,
          payload: data.payload,
        },
        ws,
      );
    }
  });

  ws.on("close", () => {
    if (ws.roomId && rooms.has(ws.roomId)) {
      const sockets = rooms.get(ws.roomId)?.filter((s) => s !== ws);
      rooms.set(ws.roomId, sockets!);
    }
  });
});

function broadcastToRoom(roomId: string, message: any, excludeWs: WebSocket) {
  const sockets = rooms.get(roomId) || [];
  sockets.forEach((s) => {
    if (s !== excludeWs && s.readyState === s.OPEN) {
      s.send(JSON.stringify(message));
    }
  });
}

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
