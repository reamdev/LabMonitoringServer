import express, { Application } from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const prisma = new PrismaClient(); // Inicializar conexión directa a la base de datos
const app: Application = express(); // Inicializar server Express

const server = http.createServer(app); // Inicializar servidor HTTP que engloba a Express

// Inicializar servidor WebSocket encima del HTTP para tiempo real.
const io = new SocketServer(server, { // Socket.IO necesita ese server de Node puro para interceptar las conexiones.
  cors: {origin: "*"},
});

// Middlewares globales
app.use(cors()); // Permitir conexiones desde otros origenes
app.use(helmet()); // Mejorar Seguridad HTTP
app.use(express.json()); // Habilitar parseo automatico de JSON en las peticiones

// Escuchamos cuando un cliente (una computadora de alumno o el docente) se conecta al servidor WebSocket.
io.on("connection", socket => {
  console.log(`Cliente conectado: ${socket.id}`);

  // Evento 1
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

  // Evento 2
  socket.on("alumno:fin", async (data: { sesionId: number }) => {
    const { sesionId } = data;
    await prisma.sesion.update({
      where: { id: sesionId },
      data: { horaFin: new Date() }
    });

    io.emit("sesion:cerrada", { sesionId });
  });

  // Evento 3
  socket.on("disconnect", () => {
    console.log(`Cliente Desconectado: ${socket.id}`);
  });
});

// Rutas
app.get("/", (_, res) => res.json({ msg: "LabMonitor Server is active." }));

app.get("/labs", async (_, res) => {
  const labs = await prisma.laboratorio.findMany({ include: {computadoras: true} });
  res.json(labs);
});

// Obtener Puerto
const PORT = process.env.PORT || 8000;

// Iniciar el servidor HTTP + WebSocket
server.listen(PORT, () => console.log(`LabMonitor Server Active in PORT ${PORT}`));
