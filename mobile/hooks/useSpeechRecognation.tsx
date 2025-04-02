import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent
} from 'expo-speech-recognition';
import { useEffect, useState } from 'react';
import { useTranslate } from './useTranslate';

interface SpeechRecognitionState {
    recognizing: boolean;
    transcript: string;
    error: string | null;
    translatedTexts: string[];
    sourceLanguage: string;
    targetLanguage: string;
}

const initialState: SpeechRecognitionState = {
    recognizing: false,
    transcript: '',
    error: null,
    translatedTexts: [],
    sourceLanguage: 'en-US',
    targetLanguage: 'ms'
};

const MAX_TRANSLATIONS_TO_DISPLAY = -5; // Limit the number of translations to display

export const useSpeechRecognition = () => {
    const [state, setState] = useState<SpeechRecognitionState>(initialState);
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
                    prev.transcript !== lastTranslated;

                if (shouldTranslate) {
                    console.log(
                        'Translating',
                        prev.transcript,
                        prev.sourceLanguage,
                        prev.targetLanguage
                    );

                    // Trigger translation and reset transcript
                    translate(prev.transcript, state.targetLanguage).finally(
                        () => {
                            setState((prevState) => ({
                                ...prevState,
                                transcript: '' // Clear transcript after translation
                            }));
                        }
                    );
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
                    translatedText
                ].slice(MAX_TRANSLATIONS_TO_DISPLAY) // Keep only the last 5 translations
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
