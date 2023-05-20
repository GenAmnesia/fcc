// const express = require('express');
const { expect } = require('chai');

// const router = express.Router();
const ConvertHandler = require('../controllers/convertHandler');

module.exports = (app) => {
    const convertHandler = new ConvertHandler();
    app
        .route('/api/convert')
        .get((req, res) => {
            const { input } = req.query;
            const initNum = convertHandler.getNum(input);
            const initUnit = convertHandler.getUnit(input);
            const returnUnit = convertHandler.getReturnUnit(initUnit);
            const returnNum = convertHandler.convert(initNum, initUnit);

            if (!initNum && !initUnit) return res.send('invalid number and unit');
            if (!initNum) return res.send('invalid number');
            if (!initUnit) return res.send('invalid unit');

            return res.json({
                initNum,
                initUnit,
                returnNum,
                returnUnit,
                string:
                    `${initNum} ${convertHandler.spellOutUnit(initUnit)} converts to ${returnNum} ${convertHandler.spellOutUnit(returnUnit)}`,
            });
        });
};
