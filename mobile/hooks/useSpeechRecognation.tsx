import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent
} from 'expo-speech-recognition';
import { useEffect, useState } from 'react';
import { useTranslate } from './useTranslate';
import { AppSettings } from 'App';

export interface TranslatedText {
    original: string;
    translation: string;
    secondaryTranslation?: string;
    tertiaryTranslation?: string;
}

interface SpeechRecognitionState {
    recognizing: boolean;
    transcript: string;
    error: string | null;
    translatedTexts: TranslatedText[];
    sourceLanguage: string;
    targetLanguage: string;
    secondaryTargetLanguage?: string;
    tertiaryTargetLanguage?: string;
}

const initialState: SpeechRecognitionState = {
    recognizing: false,
    transcript: '',
    error: null,
    translatedTexts: [],
    sourceLanguage: 'en-US',
    targetLanguage: 'ms',
    secondaryTargetLanguage: 'fr',
    tertiaryTargetLanguage: 'de'
};

const MAX_TRANSLATIONS_TO_DISPLAY = -1;

export const useSpeechRecognition = (initialSettings: AppSettings) => {
    const [state, setState] = useState<SpeechRecognitionState>({
        ...initialState,
        sourceLanguage: initialSettings.sourceLanguage,
        targetLanguage: initialSettings.primaryTarget,
        secondaryTargetLanguage: initialSettings.secondaryTarget,
        tertiaryTargetLanguage: initialSettings.tertiaryTarget
    });
    const {
        translate,
        translatedText,
        error: translationError
    } = useTranslate();

    useSpeechRecognitionEvent('start', () =>
        setState((prev) => ({ ...prev, recognizing: true }))
    );

    useSpeechRecognitionEvent('speechend', async () => {
        setTimeout(() => {
            setState((prev) => {
                const lastTranslated =
                    prev.translatedTexts.length > 0
                        ? prev.translatedTexts[prev.translatedTexts.length - 1]
                        : undefined;

                const shouldTranslate =
                    prev.transcript.trim() !== '' &&
                    prev.transcript !== lastTranslated?.original;

                if (shouldTranslate) {
                    console.log(
                        'Translating',
                        prev.transcript,
                        prev.sourceLanguage,
                        prev.targetLanguage,
                        prev.secondaryTargetLanguage,
                        prev.tertiaryTargetLanguage
                    );

                    // Trigger translation and reset transcript
                    translate(
                        prev.transcript,
                        state.targetLanguage,
                        state.secondaryTargetLanguage,
                        state.tertiaryTargetLanguage
                    ).finally(() => {
                        setState((prevState) => ({
                            ...prevState,
                            transcript: '' // Clear transcript after translation
                        }));
                    });
                }
                return prev; // Immediate return doesn't change state here
            });
        }, 1000); // Delay to allow for speech end event to be processed
    });

    useSpeechRecognitionEvent('end', () => {
        setState((prev) => ({ ...prev, recognizing: false }));
    });

    useSpeechRecognitionEvent('result', async (event) => {
        const transcript = event.results[0].transcript;
        setState((prev) => ({ ...prev, transcript }));
    });

    useSpeechRecognitionEvent('error', (event) => {
        setState((prev) => ({ ...prev, error: event.message }));
    });

    useEffect(() => {
        if (translationError) {
            console.log('Translation error:', translationError);
            setState((prev) => ({ ...prev, error: translationError }));
        }
    }, [translationError]);

    useEffect(() => {
        if (translatedText) {
            setState((prev) => ({
                ...prev,
                translatedTexts: [
                    ...prev.translatedTexts,
                    {
                        original: translatedText.original,
                        translation: translatedText.translation,
                        secondaryTranslation:
                            translatedText.secondaryTranslation,
                        tertiaryTranslation: translatedText.tertiaryTranslation
                    } as TranslatedText
                ].slice(MAX_TRANSLATIONS_TO_DISPLAY)
            }));
        }
    }, [translatedText]);

    const startListening = async () => {
        const result =
            await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!result.granted) {
            setState((prev) => ({ ...prev, error: 'Permission denied' }));
            return;
        }

        ExpoSpeechRecognitionModule.start({
            lang: state.sourceLanguage,
            interimResults: true,
            maxAlternatives: 1,
            continuous: true,
            requiresOnDeviceRecognition: false,
            addsPunctuation: false,
            contextualStrings: ['Carlsen', 'Nepomniachtchi', 'Praggnanandhaa'],
            volumeChangeEventOptions: {
                enabled: false,
                intervalMillis: 3000
            }
        });
    };

    const stopListening = () => {
        ExpoSpeechRecognitionModule.stop();
        setState(initialState);
    };

    return {
        ...state,
        setState,
        startListening,
        stopListening
    };
};
