const chai = require('chai');

const { assert } = chai;
const ConvertHandler = require('../controllers/convertHandler.js');

const convertHandler = new ConvertHandler();

const round = (num) => Math.round((num + Number.EPSILON) * 100000) / 100000;

suite('Unit Tests', () => {
    test('Read whole number', () => {
        assert.equal(convertHandler.getNum('4gal'), 4);
        assert.equal(convertHandler.getNum('12L'), 12);
        assert.equal(convertHandler.getNum('76mi'), 76);
        assert.equal(convertHandler.getNum('123km'), 123);
        assert.equal(convertHandler.getNum('55lbs'), 55);
        assert.equal(convertHandler.getNum('81kg'), 81);
    });
    test('Read decimal', () => {
        assert.equal(convertHandler.getNum('4.2gal'), 4.2);
        assert.equal(convertHandler.getNum('12.45L'), 12.45);
        assert.equal(convertHandler.getNum('7.6mi'), 7.6);
        assert.equal(convertHandler.getNum('12.03km'), 12.03);
        assert.equal(convertHandler.getNum('5.565lbs'), 5.565);
        assert.equal(convertHandler.getNum('8.145677kg'), 8.14568);
    });
    test('Read fractional', () => {
        assert.equal(convertHandler.getNum('4/2gal'), round(4 / 2));
        assert.equal(convertHandler.getNum('12/45L'), round(12 / 45));
        assert.equal(convertHandler.getNum('7/6mi'), round(7 / 6));
        assert.equal(convertHandler.getNum('1/3km'), round(1 / 3));
        assert.equal(convertHandler.getNum('5/8lbs'), round(5 / 8));
        assert.equal(convertHandler.getNum('1/2kg'), round(1 / 2));
    });
    test('Read fractional with decimal', () => {
        assert.equal(convertHandler.getNum('4.4/2gal'), round(4.4 / 2));
        assert.equal(convertHandler.getNum('4.2/2L'), round(4.2 / 2));
        assert.equal(convertHandler.getNum('7/6.5mi'), round(7 / 6.5));
        assert.equal(convertHandler.getNum('1.5/3.3km'), round(1.5 / 3.3));
        assert.equal(convertHandler.getNum('5.2/6lbs'), round(5.2 / 6));
        assert.equal(convertHandler.getNum('1.5/2.5kg'), round(1.5 / 2.5));
    });
    test('Error on double fraction', () => {
        assert.isNotOk(convertHandler.getNum('4.4/2/5gal'));
        assert.isNotOk(convertHandler.getNum('5/8/4.4km'));
        assert.isNotOk(convertHandler.getNum('3/3/12/23km'));
    });
    test('Default to input 1 when no number inserted', () => {
        assert.equal(convertHandler.getNum('gal'), 1);
        assert.equal(convertHandler.getNum('L'), 1);
        assert.equal(convertHandler.getNum('mi'), 1);
        assert.equal(convertHandler.getNum('km'), 1);
        assert.equal(convertHandler.getNum('lbs'), 1);
        assert.equal(convertHandler.getNum('kg'), 1);
    });
    test('Read input units', () => {
        assert.equal(convertHandler.getUnit('23gal'), 'gal');
        assert.equal(convertHandler.getUnit('1/2L'), 'L');
        assert.equal(convertHandler.getUnit('12.45mi'), 'mi');
        assert.equal(convertHandler.getUnit('5.5/15.3km'), 'km');
        assert.equal(convertHandler.getUnit('134lbs'), 'lbs');
        assert.equal(convertHandler.getUnit('kg'), 'kg');
    });
    test('Input units error', () => {
        assert.isNotOk(convertHandler.getUnit('23kgal'), 'gal');
        assert.isNotOk(convertHandler.getUnit('1/2min'), 'min');
        assert.isNotOk(convertHandler.getUnit('12.45mihg'), 'mi');
    });
    test('Return correct input units', () => {
        assert.equal(convertHandler.getReturnUnit('gal'), 'L');
        assert.equal(convertHandler.getReturnUnit('L'), 'gal');
        assert.equal(convertHandler.getReturnUnit('mi'), 'km');
        assert.equal(convertHandler.getReturnUnit('km'), 'mi');
        assert.equal(convertHandler.getReturnUnit('lbs'), 'kg');
        assert.equal(convertHandler.getReturnUnit('kg'), 'lbs');
    });
    test('Spell out unit', () => {
        assert.equal(convertHandler.spellOutUnit('gal'), 'gallons');
        assert.equal(convertHandler.spellOutUnit('L'), 'liters');
        assert.equal(convertHandler.spellOutUnit('mi'), 'miles');
        assert.equal(convertHandler.spellOutUnit('km'), 'kilometers');
        assert.equal(convertHandler.spellOutUnit('lbs'), 'pounds');
        assert.equal(convertHandler.spellOutUnit('kg'), 'kilograms');
    });
    test('gal to L', () => {
        assert.equal(convertHandler.convert(5, 'gal'), 18.92705);
        assert.equal(convertHandler.convert(1.5, 'gal'), 5.67812);
        assert.equal(convertHandler.convert(2 / 5, 'gal'), 1.51416);
    });
    test('L to gal', () => {
        assert.equal(convertHandler.convert(5, 'L'), 1.32086);
        assert.equal(convertHandler.convert(1.5, 'L'), 0.39626);
        assert.equal(convertHandler.convert(2 / 5, 'L'), 0.10567);
    });
    test('mi to km', () => {
        assert.equal(convertHandler.convert(5, 'mi'), 8.0467);
        assert.equal(convertHandler.convert(1.5, 'mi'), 2.41401);
        assert.equal(convertHandler.convert(2 / 5, 'mi'), 0.64374);
    });
    test('km to mi', () => {
        assert.equal(convertHandler.convert(5, 'km'), 3.10686);
        assert.equal(convertHandler.convert(1.5, 'km'), 0.93206);
        assert.equal(convertHandler.convert(2 / 5, 'km'), 0.24855);
    });
    test('lbs to kg', () => {
        assert.equal(convertHandler.convert(5, 'lbs'), 2.26796);
        assert.equal(convertHandler.convert(1.5, 'lbs'), 0.68039);
        assert.equal(convertHandler.convert(2 / 5, 'lbs'), 0.18144);
    });
    test('kg to lbs', () => {
        assert.equal(convertHandler.convert(5, 'kg'), 11.02312);
        assert.equal(convertHandler.convert(1.5, 'kg'), 3.30694);
        assert.equal(convertHandler.convert(2 / 5, 'kg'), 0.88185);
    });
});
