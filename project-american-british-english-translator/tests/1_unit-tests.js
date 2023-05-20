const chai = require('chai');

const { assert } = chai;

const Translator = require('../components/translator.js');

const translator = new Translator();

suite('Unit Tests', () => {
  suite('US to UK', () => {
    suiteSetup(() => {
      translator.setLocale('american-to-british');
    });
    test('Mangoes are my favorite fruit.', () => {
      const [translation] = translator.translate('Mangoes are my favorite fruit.');
      assert.equal(translation, 'Mangoes are my favourite fruit.');
    });
    test('I ate yogurt for breakfast.', () => {
      const [translation] = translator.translate('I ate yogurt for breakfast.');
      assert.equal(translation, 'I ate yoghurt for breakfast.');
    });
    test('We had a party at my friend\'s condo.', () => {
      const [translation] = translator.translate('We had a party at my friend\'s condo.');
      assert.equal(translation, 'We had a party at my friend\'s flat.');
    });
    test('Can you toss this in the trashcan for me?', () => {
      const [translation] = translator.translate('Can you toss this in the trashcan for me?');
      assert.equal(translation, 'Can you toss this in the bin for me?');
    });
    test('The parking lot was full.', () => {
      const [translation] = translator.translate('The parking lot was full.');
      assert.equal(translation, 'The car park was full.');
    });
    test('Like a high tech Rube Goldberg machine.', () => {
      const [translation] = translator.translate('Like a high tech Rube Goldberg machine.');
      assert.equal(translation, 'Like a high tech Heath Robinson device.');
    });
    test('To play hooky means to skip class or work.', () => {
      const [translation] = translator.translate('To play hooky means to skip class or work.');
      assert.equal(translation, 'To bunk off means to skip class or work.');
    });
    test('No Mr. Bond, I expect you to die.', () => {
      const [translation] = translator.translate('No Mr. Bond, I expect you to die.');
      assert.equal(translation, 'No Mr Bond, I expect you to die.');
    });
    test('Dr. Grosh will see you now.', () => {
      const [translation] = translator.translate('Dr. Grosh will see you now.');
      assert.equal(translation, 'Dr Grosh will see you now.');
    });
    test('Lunch is at 12:15 today.', () => {
      const [translation] = translator.translate('Lunch is at 12:15 today.');
      assert.equal(translation, 'Lunch is at 12.15 today.');
    });
  });
  suite('UK to US', () => {
    suiteSetup(() => {
      translator.setLocale('british-to-american');
    });
    test('We watched the footie match for a while.', () => {
      const [translation] = translator.translate('We watched the footie match for a while.');
      assert.equal(translation, 'We watched the soccer match for a while.');
    });
    test('Paracetamol takes up to an hour to work.', () => {
      const [translation] = translator.translate('Paracetamol takes up to an hour to work.');
      assert.equal(translation, 'Tylenol takes up to an hour to work.');
    });
    test('First, caramelise the onions.', () => {
      const [translation] = translator.translate('First, caramelise the onions.');
      assert.equal(translation, 'First, caramelize the onions.');
    });
    test('I spent the bank holiday at the funfair.', () => {
      const [translation] = translator.translate('I spent the bank holiday at the funfair.');
      assert.equal(translation, 'I spent the public holiday at the carnival.');
    });
    test('I had a bicky then went to the chippy.', () => {
      const [translation] = translator.translate('I had a bicky then went to the chippy.');
      assert.equal(translation, 'I had a cookie then went to the fish-and-chip shop.');
    });
    test('I\'ve just got bits and bobs in my bum bag.', () => {
      const [translation] = translator.translate('I\'ve just got bits and bobs in my bum bag.');
      assert.equal(translation, 'I\'ve just got odds and ends in my fanny pack.');
    });
    test('The car boot sale at Boxted Airfield was called off.', () => {
      const [translation] = translator.translate('The car boot sale at Boxted Airfield was called off.');
      assert.equal(translation, 'The swap meet at Boxted Airfield was called off.');
    });
    test('Have you met Mrs Kalyani?', () => {
      const [translation] = translator.translate('Have you met Mrs Kalyani?');
      assert.equal(translation, 'Have you met Mrs. Kalyani?');
    });
    test('Have you met Mrs Kalyani and Mr Wolf?', () => {
      const [translation] = translator.translate('Have you met Mrs Kalyani and Mr Wolf?');
      assert.equal(translation, 'Have you met Mrs. Kalyani and Mr. Wolf?');
    });
    test('Prof Joyner of King\'s College, London.', () => {
      const [translation] = translator.translate('Prof Joyner of King\'s College, London.');
      assert.equal(translation, 'Prof. Joyner of King\'s College, London.');
    });
    test('Tea time is usually around 4 or 4.30.', () => {
      const [translation] = translator.translate('Tea time is usually around 4 or 4.30.');
      assert.equal(translation, 'Tea time is usually around 4 or 4:30.');
    });
  });
  suite('Highlight Translation', () => {
    test('Mangoes are my favorite fruit.', () => {
      const translated = translator.getTranslatedString('Mangoes are my favorite fruit.', 'american-to-british');
      assert.equal(translated, 'Mangoes are my <span class="highlight">favourite</span> fruit.');
    });
    test('I ate yogurt for breakfast.', () => {
      const translated = translator.getTranslatedString('I ate yogurt for breakfast.', 'american-to-british');
      assert.equal(translated, 'I ate <span class="highlight">yoghurt</span> for breakfast.');
    });
    test('We watched the footie match for a while.', () => {
      const translated = translator.getTranslatedString('We watched the footie match for a while.', 'british-to-american');
      assert.equal(translated, 'We watched the <span class="highlight">soccer</span> match for a while.');
    });
    test('Paracetamol takes up to an hour to work.', () => {
      const translated = translator.getTranslatedString('Paracetamol takes up to an hour to work.', 'british-to-american');
      assert.equal(translated, '<span class="highlight">Tylenol</span> takes up to an hour to work.');
    });
  });
});
