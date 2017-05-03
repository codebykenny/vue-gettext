import plurals from './plurals'
import { _Vue } from './localVue'

export default {

 /**
  * Get the translated string from the translation.json file generated by easygettext.
  *
  * @param {String} msgid - The translation key
  * @param {Number} n - The number to switch between singular and plural
  * @param {String} context - The translation key context
  * @param {String} defaultPlural - The default plural value (optional)
  * @param {String} language - The language ID (e.g. 'fr_FR' or 'en_US')
  *
  * @return {String} The translated string
  */
  getTranslation: function (msgid, n = 1, context = null, defaultPlural = null, language = _Vue.config.language) {

    if (!msgid) {
      return ''  // Allow empty strings.
    }

    // `easygettext`'s `gettext-compile` generates a JSON version of a .po file based on its `Language` field.
    // But in this field, `ll_CC` combinations denoting a language’s main dialect are abbreviated as `ll`,
    // for example `de` is equivalent to `de_DE` (German as spoken in Germany).
    // See the `Language` section in https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html
    // So try `ll_CC` first, or the `ll` abbreviation which can be three-letter sometimes:
    // https://www.gnu.org/software/gettext/manual/html_node/Language-Codes.html#Language-Codes
    let translations = _Vue.$translations[language] || _Vue.$translations[language.split('_')[0]]

    if (!translations) {
      if (!_Vue.config.getTextPluginSilent) {
        console.warn(`No translations found for ${language}`)
      }
      return defaultPlural && n > 1 ? defaultPlural : msgid  // Returns the untranslated string, singular or plural.
    }

    let translated = translations[msgid]

    // Sometimes msgid may not have the same number of spaces than its key. This could happen e.g. when using
    // new lines. See comments in the `created` hook of `component.js` and issue #15 for more information.
    if (!translated && /\s{2,}/g.test(msgid)) {
      Object.keys(translations).some(key => {
        if (key.replace(/\s{2,}/g, ' ') === msgid.replace(/\s{2,}/g, ' ')) {
          translated = translations[key]
          return translated
        }
      })
    }

    if (!translated) {
      if (!_Vue.config.getTextPluginSilent) {
        console.warn(`Untranslated ${language} key found:\n${msgid}`)
      }
      return defaultPlural && n > 1 ? defaultPlural : msgid  // Returns the untranslated string, singular or plural.
    }

    if (context) {
      translated = translated[context]
    }

    if (typeof translated === 'string') {
      translated = [translated]
    }

    return translated[plurals.getTranslationIndex(language, n)]

  },

 /**
  * Returns a string of the translation of the message.
  * Also makes the string discoverable by xgettext.
  *
  * @param {String} msgid - The translation key
  *
  * @return {String} The translated string
  */
  'gettext': function (msgid) {
    return this.getTranslation(msgid)
  },

 /**
  * Returns a string of the translation for the given context.
  * Also makes the string discoverable by xgettext.
  *
  * @param {String} context - The context of the string to translate
  * @param {String} msgid - The translation key
  *
  * @return {String} The translated string
  */
  'pgettext': function (context, msgid) {
    return this.getTranslation(msgid, 1, context)
  },

 /**
  * Returns a string of the translation of either the singular or plural,
  * based on the number.
  * Also makes the string discoverable by xgettext.
  *
  * @param {String} msgid - The translation key
  * @param {String} plural - The plural form of the translation key
  * @param {Number} n - The number to switch between singular and plural
  *
  * @return {String} The translated string
  */
  'ngettext': function (msgid, plural, n) {
    return this.getTranslation(msgid, n, null, plural)
  },

 /**
  * Returns a string of the translation of either the singular or plural,
  * based on the number, for the given context.
  * Also makes the string discoverable by xgettext.
  *
  * @param {String} context - The context of the string to translate
  * @param {String} msgid - The translation key
  * @param {String} plural - The plural form of the translation key
  * @param {Number} n - The number to switch between singular and plural
  *
  * @return {String} The translated string
  */
  'npgettext': function (context, msgid, plural, n) {
    return this.getTranslation(msgid, n, context, plural)
  },

}