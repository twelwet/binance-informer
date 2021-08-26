'use strict';

const Binance = require(`node-binance-api`);
require(`dotenv`).config();

const binance = new Binance().options({
  APIKEY: process.env.NB_KEY_OUR,
  APISECRET: process.env.NB_SECRET_OUR,
});

module.exports = binance;
