import { useState } from 'react';

interface TranslateState {
    isTranslating: boolean;
    error: string | null;
    translatedText: string | null;
}

export const useTranslate = () => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [translatedText, setTranslatedText] = useState<string | null>(null);

    const apiEndpoint = 'http://192.168.1.14:3000/translate'; // Replace with your actual API endpoint

    const translate = async (text: string, language: string) => {
        setIsTranslating(true);
        setError(null);
        setTranslatedText(null);

        console.log('Translating:', text, language);

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
                body: JSON.stringify({ text, language })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Response:', response);
            const data = await response.json();
            setTranslatedText(data.translatedText);
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
