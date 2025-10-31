-- CreateTable
CREATE TABLE "Laboratorio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT
);

-- CreateTable
CREATE TABLE "Computadora" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "laboratorioId" INTEGER NOT NULL,
    CONSTRAINT "Computadora_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "Laboratorio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "computadoraId" INTEGER NOT NULL,
    "horaInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaFin" DATETIME,
    CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sesion_computadoraId_fkey" FOREIGN KEY ("computadoraId") REFERENCES "Computadora" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_codigo_key" ON "Usuario"("codigo");
