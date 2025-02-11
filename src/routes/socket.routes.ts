// This Route is to test Socket.Io Emit by hitting the endpoint

import { Router } from "express";
import socketService from "../services/socket.service";

const socketRouter = Router();

socketRouter.post("/emit", (req, res) => {
  const { auctionId, event, entity, data } = req.body;
  const socketData = { entity, data };
  socketService.emitToRoom(auctionId, event, socketData);
  res.json({ message: "Emitting event" });
});

export default socketRouter;
