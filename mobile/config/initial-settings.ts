import { LanguageSettings } from '../types';

const MAX_WORDS_COUNT_BEFORE_RESET = 30;

const DEFAULT_SETTINGS: LanguageSettings = {
  firstLanguage: 'en',
  secondLanguage: 'ms',
  thirdLanguage: 'ar',
  fourthLanguage: 'ta',
  maxWordsCountBeforeReset: MAX_WORDS_COUNT_BEFORE_RESET
};

export { DEFAULT_SETTINGS };
