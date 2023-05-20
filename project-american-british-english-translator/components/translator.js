const americanOnly = require('./american-only');
const americanToBritishTitles = require('./american-to-british-titles');
const britishOnly = require('./british-only');
const americanToBritishSpelling = require('./american-to-british-spelling');

const usSpellingMap = new Map(Object.entries(americanToBritishSpelling));
const ukSpellingMap = new Map(
  [...Object.entries(americanToBritishSpelling)].map(([k, v]) => [v, k]),
);

class Translator {
  constructor() {
    this.locale = 'american-to-british';
  }

  setLocale(locale) {
    this.locale = locale;
  }

  getLocale() {
    return this.locale;
  }

  translate(string) {
    const objCompounds = this.locale === 'american-to-british' ? americanOnly : britishOnly;
    const mapSpelling = this.locale === 'american-to-british' ? usSpellingMap : ukSpellingMap;
    const objTitles = this.locale === 'american-to-british'
      ? americanToBritishTitles
      : Object.fromEntries(
        Object.entries(americanToBritishTitles).map(([k, v]) => [v, k]),
      );

    let translated = `${string}`;
    const highlights = [];

    translated = Object.entries(objCompounds).filter(([key]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      return regex.test(translated);
    }).reduce((acc, [key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      return acc.replace(regex, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          highlights.push(value.charAt(0).toUpperCase() + value.slice(1));
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
        highlights.push(value);
        return value;
      });
    }, translated);

    translated = Object.entries(objTitles)
      .sort(([keyA], [keyB]) => keyB.length - keyA.length)
      .filter(([key]) => {
        const regex = new RegExp(key.endsWith('.') ? `\\b${key.slice(0, -1)}\\b.` : `\\b${key}\\b`, 'gi');
        return regex.test(translated);
      })
      .reduce((acc, [key, value]) => {
        const regex = new RegExp(key.endsWith('.') ? `\\b${key.slice(0, -1)}\\b.` : `\\b${key}\\b`, 'gi');
        return acc.replace(regex, (match) => {
          if (match[0] === match[0].toUpperCase()) {
            highlights.push(value.charAt(0).toUpperCase() + value.slice(1));
            return value.charAt(0).toUpperCase() + value.slice(1);
          }
          highlights.push(value);
          return value;
        });
      }, translated);

    const words = translated.split(' ');
    const translatedWords = words.map((word) => {
      if (this.locale === 'american-to-british') {
        const timeRegex = /\d{1,2}:\d\d/gi;
        if (timeRegex.test(word)) {
          highlights.push(word.replace(':', '.'));
          return word.replace(':', '.');
        }
      }
      if (this.locale === 'british-to-american') {
        const timeRegex = /\d{1,2}\.\d\d/gi;
        if (timeRegex.test(word)) {
          highlights.push(word.replace('.', ':'));
          return word.replace('.', ':');
        }
      }
      if (mapSpelling.has(word)) {
        highlights.push(mapSpelling.get(word));
        return mapSpelling.get(word);
      }
      return word;
    });
    translated = translatedWords.join(' ');
    return [translated, highlights];
  }

  static highlight(translated, highlights) {
    let highlitedString = `${translated}`;
    highlights.forEach((word) => {
      highlitedString = highlitedString.replace(word, `<span class="highlight">${word}</span>`);
    });
    return highlitedString;
  }

  getTranslatedString(string, locale) {
    this.locale = locale;
    const [translated, highlights] = this.translate(string);
    if (string === translated) return 'Everything looks good to me!';
    const highlightedString = Translator.highlight(translated, highlights);
    return highlightedString;
  }
}

module.exports = Translator;
