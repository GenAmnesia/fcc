const Translator = require('../components/translator');

module.exports = function (app) {
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      if (!req.body.hasOwnProperty('locale') || !req.body.hasOwnProperty('text')) return res.send({ error: 'Required field(s) missing' });
      if (!req.body.text) return res.send({ error: 'No text to translate' });
      if (req.body.locale !== 'american-to-british' && req.body.locale !== 'british-to-american') return res.send({ error: 'Invalid value for locale field' });
      const translatedString = translator.getTranslatedString(req.body.text, req.body.locale);
      return res.send({ text: req.body.text, translation: translatedString });
    });
};
