import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { fetchS3Folder, saveToS3 } from "./aws";
import path from "path";
import { fetchDir, fetchFileContent, saveFile } from "./fs";
import { TerminalManager } from "./pty";

const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket: Socket) => {
    console.log("a user connected");
    const replId = socket.handshake.query.replId as string;
    if (!replId) {
      socket.disconnect();
      terminalManager.clear(socket.id);
      return;
    }
    await fetchS3Folder(`code/${replId}`, `../tmp/${replId}`);
    socket.emit("loaded", {
      rootContent: await fetchDir(path.join(__dirname, `../tmp/${replId}`), ""),
    });

    initHandlers(socket, replId);
  });
}

function initHandlers(socket: Socket, replId: string) {
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("fetchDir", async (dir: string, callback) => {
    const dirPath = path.join(__dirname, `../tmp/${replId}/${dir}`);
    const data = await fetchDir(dirPath, dir);
    callback(data);
  });

  socket.on("fetchFileContent", async (filePath: string, callback) => {
    const fullPath = path.join(__dirname, `../tmp/${replId}/${filePath}`);
    const content = await fetchFileContent(fullPath);
    callback(content);
  });

  socket.on("updateContent", async (filePath: string, content: string) => {
    const fullPath = path.join(__dirname, `../tmp/${replId}/${filePath}`);
    await saveFile(fullPath, content);
    await saveToS3(`code/${replId}/${filePath}`, filePath, content);
  });

  socket.on("requestTerminal", () => {
    terminalManager.createPty(socket.id, replId, (data, id) => {
      socket.emit("terminal", {
        data: Buffer.from(data, "utf8"),
      });
    });
  });

  socket.on("terminalData", (data) => {
    terminalManager.write(socket.id, data);
  });
}
