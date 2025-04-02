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
}

const initialState: SpeechRecognitionState = {
    recognizing: false,
    transcript: '',
    error: null
};

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

    useSpeechRecognitionEvent('end', () =>
        setState((prev) => ({ ...prev, recognizing: false }))
    );

    useSpeechRecognitionEvent('result', async (event) => {
        const transcript = event.results[0].transcript;

        setState((prev) => ({ ...prev, transcript }));

        if (transcript) {
            await translate(transcript, 'ms');
        }
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

    const startListening = async () => {
        const result =
            await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!result.granted) {
            setState((prev) => ({ ...prev, error: 'Permission denied' }));
            return;
        }

        ExpoSpeechRecognitionModule.start({
            lang: 'en-US',
            interimResults: true,
            maxAlternatives: 1,
            continuous: false,
            requiresOnDeviceRecognition: false,
            addsPunctuation: false,
            contextualStrings: ['Carlsen', 'Nepomniachtchi', 'Praggnanandhaa']
        });
    };

    const stopListening = () => {
        ExpoSpeechRecognitionModule.stop();
        setState(initialState);
    };

    return {
        ...state,
        translatedText,
        startListening,
        stopListening
    };
};
