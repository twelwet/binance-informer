'use strict';

const {prices: getAllSpotPrices, balance: getAccountSpotBalance} = require(`./services/binance`);
const {handleError} = require(`./utils`);

const getPrices = () => getAllSpotPrices()
  .then((allPrices) => {
    const prices = {};
    for (const symbol in allPrices) {
      prices[symbol] = parseFloat(allPrices[symbol]);
    }
    return prices;
  })
  .catch((error) => handleError(error));

const getBalance = (prices) => getAccountSpotBalance()
  .then((allBalances) => {
    const balances = [];
    for (const asset in allBalances) {
      const coin = {};
      coin.name = asset;
      coin.available = parseFloat(allBalances[asset].available);
      coin.onOrder = parseFloat(allBalances[asset].onOrder);
      coin.btcValue = 0;
      coin.btcTotal = 0;
      switch (asset) {
        case `BTC`:
          coin.btcValue = coin.available;
          coin.btcTotal = coin.available + coin.onOrder;
          break;
        case `USDT`:
          coin.btcValue = coin.available / prices.BTCUSDT;
          coin.btcTotal = (coin.available + coin.onOrder) / prices.BTCUSDT;
          break;
        default:
          coin.btcValue = coin.available * prices[`${asset}BTC`];
          coin.btcTotal = (coin.available + coin.onOrder) * prices[`${asset}BTC`];
          break;
      }
      if (isNaN(coin.btcValue)) {
        coin.btcValue = 0;
      }
      if (isNaN(coin.btcTotal)) {
        coin.btcTotal = 0;
      }

      if (coin.available > 0 || coin.onOrder > 0) {
        balances.push(coin);
      }
    }

    balances.sort((a, b) => b.btcTotal - a.btcTotal);

    const sumBtcValue = balances.map((balance) => balance.btcValue).reduce((accumulator, currentValue) => accumulator + currentValue);
    const sumBtcTotal = balances.map((balance) => balance.btcTotal).reduce((accumulator, currentValue) => accumulator + currentValue);

    const sum = {
      BTC: {
        total: sumBtcTotal,
        available: sumBtcValue,
        onOrder: sumBtcTotal - sumBtcValue,
      },
      USDT: {
        total: sumBtcTotal * prices.BTCUSDT,
        available: sumBtcValue * prices.BTCUSDT,
        onOrder: sumBtcTotal * prices.BTCUSDT - sumBtcValue * prices.BTCUSDT,
      }
    };
    return {suitcase: balances, balance: sum};
  })
  .catch((error) => handleError(error));

const getSpotInfo = (arg = `balance`) => getPrices().then(getBalance).then((result) => result[`${arg}`]);

module.exports = getSpotInfo;
