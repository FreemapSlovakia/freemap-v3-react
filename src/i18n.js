export const languages = { en: 'English', sk: 'Slovensky', cs: 'Česky' };

export function getBrowserLanguage(language) {
  return language && languages[language] ? language
    : (navigator.languages.map(language => language.split('-')[0]).find(language => languages[language]) || 'en');
}

export function readMessages(language) {
  const messages = Object.assign({}, require(`../i18n/en.json`), require(`../i18n/${language}.json`));
  Object.keys(messages).forEach(function (key) {
    const message = messages[key];
    if (Array.isArray(message)) {
      messages[key] = message.join('\n');
    }
  });
  return messages;
}
