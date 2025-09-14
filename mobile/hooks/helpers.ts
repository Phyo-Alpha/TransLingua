import { ServerMessage, TranscriptResponse, TranslationResponse } from 'types';
import { languagesLabel } from './languages';

function formatSeconds(duration: number | null | undefined) {
  if (
    duration == null ||
    Number.isNaN(duration) ||
    !Number.isFinite(duration)
  ) {
    return '--:--.---';
  }
  const { hours, minutes, seconds, milliseconds } =
    extractDurationFromDurationInMs(duration * 1000);
  const fractions: number[] = [minutes, seconds];
  if (hours) fractions.unshift(hours);
  return [
    fractions.map((number) => number.toString().padStart(2, '0')).join(':'),
    milliseconds.toString().padStart(3, '0')
  ].join('.');
}

function extractDurationFromDurationInMs(durationInMs: number) {
  if (!Number.isFinite(durationInMs) || durationInMs < 0) {
    throw new Error(`${durationInMs} isn't a valid duration`);
  }

  const milliseconds = Math.floor(durationInMs % 1000);
  let seconds = Math.floor(durationInMs / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return {
    hours,
    minutes,
    seconds,
    milliseconds
  };
}

function printMessage(message: ServerMessage) {
  if (message.type === 'transcript' && message.data.is_final) {
    const { text, start, end, language } = message.data.utterance;
    console.log(
      `${formatSeconds(start)} --> ${formatSeconds(
        end
      )} | ${languagesLabel[language as keyof typeof languagesLabel]} | ${text.trim()}`
    );
  } else if (message.type === 'post_final_transcript') {
    console.log();
    console.log('################ End of session ################');
    console.log();
    console.log(JSON.stringify(message.data, null, 2));
  } else if (message.type === 'translation') {
    const { text, language } = message.data.translated_utterance;
    console.log(
      `Translated text: ${languagesLabel[language as keyof typeof languagesLabel]} | ${text.trim()}`
    );
  }
}

interface SetResponseProps {
  message: ServerMessage;
  translations: TranslationResponse[];
  setTranscript: (transcript: TranscriptResponse) => void;
  setTranslations: (
    translations:
      | TranslationResponse[]
      | ((prev: TranslationResponse[]) => TranslationResponse[])
  ) => void;
  maxWordsCountBeforeReset: number;
}
function setResponse({
  message,
  translations,
  setTranscript,
  setTranslations,
  maxWordsCountBeforeReset
}: SetResponseProps) {
  if (message.type === 'transcript' && message.data.is_final) {
    const { text, language } = message.data.utterance;
    setTranscript({
      transcript: text,
      language: languagesLabel[language as keyof typeof languagesLabel]
    });
  } else if (message.type === 'translation') {
    const { text, language } = message.data.translated_utterance;
    const targetLanguage =
      languagesLabel[language as keyof typeof languagesLabel];

    // Use functional update to ensure we're working with the latest state
    setTranslations((prevTranslations: TranslationResponse[]) => {
      const r = handleTranslationResponse(
        prevTranslations,
        targetLanguage,
        text,
        maxWordsCountBeforeReset
      );

      console.log('--------Translation Response---------');
      console.log(JSON.stringify(r, null, 2));
      console.log('--------Translation Response---------');

      return r;
    });
  }
}

/**
 * @description This handles the translation response from Gladia and update the existing translations array
 *
 * @param prevTranslations
 * @param targetLanguage
 * @param text
 * @param maxWordsCountBeforeReset - The maximum number of words before resetting the translation
 */
function handleTranslationResponse(
  prevTranslations: TranslationResponse[],
  targetLanguage: string,
  text: string,
  maxWordsCountBeforeReset: number
) {
  const lastTranslation = prevTranslations[prevTranslations.length - 1];

  // If there is no last translation, we need to create a new translation response
  if (!lastTranslation) {
    return [
      {
        sectionNumber: 1,
        translations: [
          {
            translation: text,
            language: targetLanguage
          }
        ]
      }
    ];
  }

  const lastTranslationSection = lastTranslation.sectionNumber;

  // Finding the previous translation with the same target language
  const prevTranslation = lastTranslation.translations.find(
    (t) => t.language === targetLanguage
  );

  if (!prevTranslation) {
    const newTranslation = {
      translation: text,
      language: targetLanguage
    };

    const updatedTranslations = [
      ...lastTranslation.translations,
      newTranslation
    ];

    // Update the last section instead of creating a new one
    return [
      ...prevTranslations.slice(0, -1),
      {
        sectionNumber: lastTranslationSection,
        translations: updatedTranslations
      }
    ];
  }

  const shouldConcat =
    prevTranslation &&
    prevTranslation.translation.split(' ').length < maxWordsCountBeforeReset;

  if (shouldConcat) {
    const otherLanguageTranslations = lastTranslation.translations.filter(
      (t) => t.language !== targetLanguage
    );

    const newTranslation = {
      translation: prevTranslation.translation + ' ' + text,
      language: targetLanguage
    };

    // Update the last section instead of creating a new one
    return [
      ...prevTranslations.slice(0, -1),
      {
        sectionNumber: lastTranslationSection,
        translations: [...otherLanguageTranslations, newTranslation]
      }
    ];
  } else {
    // Create a new section only when we need to reset
    const newTranslationSection = {
      sectionNumber: lastTranslationSection + 1,
      translations: [
        {
          translation: text,
          language: targetLanguage
        }
      ]
    };
    return [...prevTranslations, newTranslationSection];
  }

  // const translationsMap = new Map(
  //   prevTranslations.map((t: TranslationResponse) => [t.language, t])
  // );

  // if (translationsMap.get(targetLanguage)?.translation === undefined) {
  //   translationsMap.set(targetLanguage, {
  //     translation: text,
  //     language: targetLanguage
  //   });
  //   return Array.from(translationsMap.values());
  // }

  // const shouldConcat = prevTranslations.every(
  //   (t) => t.translation.split(' ').length < maxWordsCountBeforeReset
  // );

  // // Update or add the new translation
  // translationsMap.set(targetLanguage, {
  //   translation: shouldConcat
  //     ? translationsMap.get(targetLanguage)?.translation + ' ' + text
  //     : text,
  //   language: targetLanguage
  // });

  // // Convert back to array and return
  // return Array.from(translationsMap.values());
}

export {
  formatSeconds,
  extractDurationFromDurationInMs,
  printMessage,
  setResponse
};

// const detectVoice = (analysis: AudioAnalysisEvent): boolean => {
//   const { dataPoints } = analysis;

//   if (!dataPoints || dataPoints.length === 0) return false;

//   for (const point of dataPoints) {
//     const { rms, energy, zcr, pitch, spectralCentroid } = point.features || {};

//     // Voice detection thresholds
//     const hasAdequateEnergy = energy && energy > 0.005;
//     const hasReasonableRMS = rms && rms > 0.02;
//     const hasSpeechLikeZCR = zcr && zcr > 0.08 && zcr < 0.6;
//     const hasHumanPitch = pitch && pitch > 60 && pitch < 500;

//     if (
//       hasAdequateEnergy &&
//       hasReasonableRMS &&
//       hasSpeechLikeZCR &&
//       hasHumanPitch
//     ) {
//       console.log('Voice detected');
//       return true;
//     }
//   }

//   return false;
// };
