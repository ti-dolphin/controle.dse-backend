const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error.message);
    process.exit(1); // Encerra a aplicação se a conexão falhar
  }
}

async function disconnect() {
  try {
    await prisma.$disconnect();
    console.log("Desconectado do banco de dados com sucesso!");
  } catch (error) {
    console.error("Erro ao desconectar do banco de dados:", error.message);
  }
}

testConnection();

module.exports = { prisma, disconnect };
