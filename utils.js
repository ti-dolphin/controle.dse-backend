const fs = require("fs");

function buildWhere(params, numericFields = []) {
  const where = {};
  for (const key in params) {
    if (
      params[key] !== undefined &&
      params[key] !== null &&
      params[key] !== ""
    ) {
      // Suporte para filtros do tipo { in: [...] }
      if (
        typeof params[key] === "object" &&
        params[key] !== null &&
        "in" in params[key]
      ) {
        where[key] = { in: params[key].in };
        continue;
      }
      // Verifica se o campo é um objeto para relacionamento
      const relField = numericFields.find(
        (f) =>
          typeof f === "object" &&
          Object.keys(f)[0] &&
          f[Object.keys(f)[0]] === key
      );
      if (relField) {
        const relName = Object.keys(relField)[0];
        where[relName] = { [key]: Number(params[key]) };
      } else if (numericFields.includes(key)) {
        where[key] = Number(params[key]);
      } else {
        where[key] = params[key];
      }
    }
  }
  return where;
}
const utils = {
  removeFile: (filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) console.log(err);
    });
  },
  buildWhere,
};
module.exports = utils;
