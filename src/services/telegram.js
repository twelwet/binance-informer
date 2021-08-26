'use strict';

const TelegramBot = require(`node-telegram-bot-api`);
require(`dotenv`).config();

const bot = new TelegramBot(process.env.TG_KEY, {polling: true});

module.exports = bot;
