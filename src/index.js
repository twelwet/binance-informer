'use strict';

require(`dotenv`).config();
const getSpotInfo = require(`./get-spot-info`);
const bot = require(`./services/telegram`);
const {isChatIDExistInWhiteList} = require(`./utils`);

const Arg = {
  BALANCE: `balance`,
  SUITCASE: `suitcase`,
};

const chatIDs = [process.env.TG_CHAT_ID_1, process.env.TG_CHAT_ID_2, process.env.TG_CHAT_ID_3];
const password = process.env.TG_BOT_PASSWORD;

bot.onText(/\/start/, async (startMsg) => {
  await bot.sendMessage(startMsg.from.id, `Привет, ${startMsg.from[`first_name`]} ${startMsg.from[`last_name`]}, твой ID: ${startMsg.from.id}.`);

  if (isChatIDExistInWhiteList(chatIDs, startMsg.from.id)) {
    bot.clearTextListeners();
    await bot.sendMessage(startMsg.from.id, `Еще нужен пароль. Знаешь?`);
    bot.onText(new RegExp(password), async (passwordMsg) => {

      await bot.deleteMessage(passwordMsg.chat.id, passwordMsg[`message_id`]);
      await bot.sendMessage(passwordMsg.from.id, `Доступ получен.`);
      await bot.sendMessage(passwordMsg.from.id, `Спотовый кошелек.`);
      await bot.sendMessage(passwordMsg.from.id, `Используй команды: "Баланс", "Портфель", "Ордера"`);
      bot.clearTextListeners();

      bot.onText(/Баланс/, (balanceMsg) => {
        getSpotInfo(Arg.BALANCE).then(async (res) => {
          await bot.sendMessage(balanceMsg.from.id, `Всего: \n${res.USDT.total.toFixed(2)} USDT ~ ${res.BTC.total.toFixed(6)} BTC`);
          await bot.sendMessage(balanceMsg.from.id, `Доступно: \n${res.USDT.available.toFixed(2)} USDT ~ ${res.BTC.available.toFixed(6)} BTC`);
          await bot.sendMessage(balanceMsg.from.id, `Ордера: \n${res.USDT.onOrder.toFixed(2)} USDT ~ ${res.BTC.onOrder.toFixed(6)} BTC`);
        });
      });

      bot.onText(/Портфель/, (suitCaseMsg) => {
        getSpotInfo(Arg.SUITCASE).then(async (res) => {
          await bot.sendMessage(suitCaseMsg.from.id, `Найдено ${res.length} токенов, подгружаю...`);
          res.map(async (item) => await bot.sendMessage(suitCaseMsg.from.id, `${item.name} \nДоступно: ${item.available.toFixed(2)} ${item.name} ~ ${item.btcValue.toFixed(6)} BTC, \nОрдера: ${item.onOrder.toFixed(2)} ${item.name} ~ ${(item.btcTotal - item.btcValue).toFixed(6)} BTC.`
          ));
        });
      });

      bot.onText(/Ордера/, (ordersMsg) => {
        getSpotInfo(Arg.SUITCASE).then(async (res) => {
          const orders = res.filter((item) => item.onOrder > 0);
          await bot.sendMessage(ordersMsg.from.id, `Найдено ордеров: ${orders.length}, подгружаю...`);
          orders.map(async (item) => await bot.sendMessage(ordersMsg.from.id, `${item.name} \nОрдера: ${item.onOrder.toFixed(2)} ${item.name} ~ ${(item.btcTotal - item.btcValue).toFixed(6)} BTC.`
          ));
        });
      });

    });
  }
});
