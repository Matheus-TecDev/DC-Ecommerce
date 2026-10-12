var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.json({ servico: "Digital Store API", status: "ok" });
});

module.exports = router;
