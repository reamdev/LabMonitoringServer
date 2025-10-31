import express, { Application } from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();
const app: Application = express();

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {origin: "*"},
});

app.use(cors());
app.use(helmet());
app.use(express.json());

io.on("connection", socket => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("alumno:inicio", async (data: {codigo: string; computadoraId: number }) => {
    const { codigo, computadoraId } = data;
    const user = await prisma.usuario.findUnique({ where: { codigo } });

    if (!user) return;

    const sesion = await prisma.sesion.create({
      data: {usuarioId: user.id, computadoraId},
      include: {usuario: true},
    });

    io.emit("sesion:nueva", sesion);
  });

  socket.on("alumno:fin", async (data: { sesionId: number }) => {
    const { sesionId } = data;
    await prisma.sesion.update({
      where: { id: sesionId },
      data: { horaFin: new Date() }
    });

    io.emit("sesion:cerrada", { sesionId });
  });

  socket.on("disconnect", () => {
    console.log(`Cliente Desconectado: ${socket.id}`);
  });
});

app.get("/", (_, res) => res.json({ msg: "LabMonitor Server is active." }));

app.get("/labs", async (_, res) => {
  const labs = await prisma.laboratorio.findMany({ include: {computadoras: true} });
  res.json(labs);
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`LabMonitor Server Active in PORT ${PORT}`));
