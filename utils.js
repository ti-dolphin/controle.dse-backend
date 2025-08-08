const fs = require("fs");


const getSystemProfileList = async (user)=> { 
  const profiles = await prisma.web_perfil_usuario.findMany();
  const profileMap = {
    PERM_COMPRADOR: "Comprador",
    PERM_DIRETOR: "Diretor",
    PERM_ADMINISTRADOR: "Administrador",
  };

  Object.entries(profileMap).forEach(([permKey, profileName]) => {
    if (user[permKey] === 1) {
      const profile = profiles.find((p) => p.nome === profileName);
      if (profile) user_profile_id_list.push(profile.id_perfil_usuario);
    }
  });
}

const getNowISODate = () =>  { 
  const now = new Date();
  now.setHours(now.getHours() - 3);
  return now.toISOString();
}

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
function formatToCurrency(value) {
 const formattedValue = value
   ? Number(value).toLocaleString("pt-BR", {
       style: "currency",
       currency: "BRL",
     })
   : "";
        return formattedValue;
}
const utils = {
  removeFile: (filePath) => {
    fs.unlink(filePath, (err) => {
      if (err);
    });
  },
  buildWhere,
  getSystemProfileList,
  getNowISODate,
  formatToCurrency
};
module.exports = utils;
