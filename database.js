const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "35.198.25.52",
  user: "homolog-user",
  database: "dsecombr_controle",
  password: "password",
  port: 3306,
  waitForConnections: true,
  timezone: "local",
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
});

async function testConnection() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error.message);
    process.exit(1); // Encerra a aplicação se a conexão falhar
  }
}

async function disconnect() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Erro ao desconectar do banco de dados:", error.message);
  }
}

testConnection();
module.exports = { prisma, disconnect, pool };
