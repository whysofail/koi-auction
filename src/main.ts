import http from "http";
import { Server } from "socket.io";
import createApp from "./app";
import initializeSockets from "./sockets";
import { AppDataSource } from "./config/data-source";
import { socketAuthMiddleware } from "./middlewares/socketauth.middleware";
import initializeRefreshTokenCleanup from "./cron/scheduler";

AppDataSource.initialize()
  .then(() => initializeRefreshTokenCleanup())
  .catch((error) => console.log(error));

const app = createApp();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

initializeSockets(io);
io.use(socketAuthMiddleware);

server.listen(process.env.PORT || 8001, () => {
  console.log(`This app is running on port ${process.env.PORT || 8001}`);
});
