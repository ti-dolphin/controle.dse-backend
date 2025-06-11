const PatrimonyRepository = require("../repositories/PatrimonyRepository");
const pool = require("../database");
const fireBaseService = require("./fireBaseService");
const opcoes = {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
};

class PatrimonyService {
}

module.exports = PatrimonyService;
