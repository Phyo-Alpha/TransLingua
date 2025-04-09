import { useState } from 'react';
import { TranslatedText } from './useSpeechRecognation';

export const useTranslate = () => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [translatedText, setTranslatedText] = useState<TranslatedText | null>(
        null
    );

    const apiEndpoint = 'https://trans-lingua.vercel.app/translate'; // Replace with your actual API endpoint

    const translate = async (
        text: string,
        language: string,
        secondaryLanguage?: string,
        tertiaryLanguage?: string
    ) => {
        setIsTranslating(true);
        setError(null);
        setTranslatedText(null);

        if (!text || !language) {
            console.log('Invalid input for translation:', { text, language });
            setError('Invalid input for translation');
            setIsTranslating(false);
            return;
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    language,
                    secondaryLanguage,
                    tertiaryLanguage
                })
            });

            if (!response.ok) {
                console.log('Translation API error:', response.statusText);
                setError('Translation API error: ' + response.statusText);
                return;
            }

            const data = await response.json();
            console.log('Translation response:', data);
            setTranslatedText({
                original: text,
                translation: data.translatedText,
                secondaryTranslation: data.secondaryTranslatedText,
                tertiaryTranslation: data.tertiaryTranslatedText
            });
        } catch (error: any) {
            setError(error);
        } finally {
            setIsTranslating(false);
        }
    };

    return {
        isTranslating,
        error,
        translatedText,
        translate
    };
};
