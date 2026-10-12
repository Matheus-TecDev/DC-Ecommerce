function erro(status, mensagem) {
  const err = new Error(mensagem);
  err.status = status;
  return err;
}

function assincrono(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function texto(valor, { min = 1, max = 200 } = {}) {
  if (typeof valor !== "string") return false;
  const tamanho = valor.trim().length;
  return tamanho >= min && tamanho <= max;
}

function numero(valor, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= min && valor <= max;
}

module.exports = { erro, assincrono, texto, numero };
