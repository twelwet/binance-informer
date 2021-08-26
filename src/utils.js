'use strict';

const getFloat = (string) => Math.round(parseFloat(string) * 100000000) / 100000000;

const handleError = (error) => ({error: error.message});

const isChatIDExistInWhiteList = (items, value) => items.find((item) => item.toString() === value.toString());

module.exports = {getFloat, handleError, isChatIDExistInWhiteList};
