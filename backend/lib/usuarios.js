const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA = { min: 8, max: 72 };

function normalizarEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function emailValido(email) {
  return email.length <= 254 && EMAIL.test(email);
}

function senhaValida(password) {
  return typeof password === "string" && password.length >= SENHA.min && password.length <= SENHA.max;
}

function semSenha({ password, ...publico }) {
  return publico;
}

module.exports = { SENHA, normalizarEmail, emailValido, senhaValida, semSenha };
