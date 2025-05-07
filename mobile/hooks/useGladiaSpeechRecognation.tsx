import { useEffect, useState, useCallback } from "react";
import { InitiateResponse, LanguageSettings, ServerMessage, StreamingAudioFormat, StreamingConfig, TranscriptResponse, TranslationResponse } from "types";
import { useAudioRecorder, RecordingConfig, AudioDataEvent } from '@siteed/expo-audio-studio';
import { formatSeconds } from "./helpers";

export function getMicrophoneAudioFormat(): StreamingAudioFormat {
    return {
        encoding: 'wav/pcm',
        bit_depth: 16,
        sample_rate: 16_000,
        channels: 1
    };
}

async function initLiveSession(settings: LanguageSettings) {
    const gladiaApiUrl = 'https://api.gladia.io';
    const gladiaKey = '4b6a6c1c-9235-4094-bb97-607eca7e4b81';

    // Get target languages from settings
    const targetLanguages = [
        settings.firstLanguage,
        settings.secondLanguage,
        settings.thirdLanguage,
        settings.fourthLanguage
    ] as string[];

    const config: StreamingConfig = {
        language_config: {
            languages: [], // Empty array for auto-detection
            code_switching: true
        },
        realtime_processing: {
            translation: true,
            translation_config: {
                target_languages: targetLanguages
            }
        }
    };

    const response = await fetch(`${gladiaApiUrl}/v2/live`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-GLADIA-KEY': gladiaKey
        },
        body: JSON.stringify({ ...getMicrophoneAudioFormat(), ...config })
    });
    if (!response.ok) {
        console.error(
            `${response.status}: ${(await response.text()) || response.statusText}`
        );
        throw new Error('Failed to initialize live session');
    }

    const initiateResponse = await response.json();
    return initiateResponse;
}

const languagesLabel = {
    en: 'English',
    ms: 'Malay',
    bn: 'Bengali',
    ar: 'Arabic',
    ur: 'Urdu'
} as const;

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
        console.log(`Translated text: ${languagesLabel[language as keyof typeof languagesLabel]} | ${text.trim()}`);
    }
}

interface SetResponseProps {
    message: ServerMessage;
    translations: TranslationResponse[];
    setTranscript: (transcript: TranscriptResponse) => void;
    setTranslations: (translations: TranslationResponse[] | ((prev: TranslationResponse[]) => TranslationResponse[])) => void;
}
function setResponse({ message, translations, setTranscript, setTranslations }: SetResponseProps) {
    if (message.type === 'transcript' && message.data.is_final) {
        const { text, language } = message.data.utterance;
        setTranscript({
            transcript: text,
            language: languagesLabel[language as keyof typeof languagesLabel]
        });
    } else if (message.type === 'translation') {
        const { text, language } = message.data.translated_utterance;
        const targetLanguage = languagesLabel[language as keyof typeof languagesLabel];

        // Use functional update to ensure we're working with the latest state
        setTranslations((prevTranslations: TranslationResponse[]) => {
            // Convert previous translations to a map
            const translationsMap = new Map(prevTranslations.map((t: TranslationResponse) => [t.language, t]));

            // Update or add the new translation
            translationsMap.set(targetLanguage, {
                translation: text,
                language: targetLanguage
            });

            // Convert back to array and return
            return Array.from(translationsMap.values());
        });
    }
}

export default function useGladiaSpeechRecognition(settings: LanguageSettings) {
    const [initiateResponse, setInitiateResponse] = useState<InitiateResponse | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
    const [translations, setTranslations] = useState<TranslationResponse[]>([]);

    const {
        startRecording,
        stopRecording,
        isRecording,
    } = useAudioRecorder();

    const handleMessage = useCallback((event: MessageEvent) => {
        const message = JSON.parse(event.data.toString());
        printMessage(message);
        setResponse({ message, translations, setTranscript, setTranslations });
    }, [translations, setTranscript, setTranslations]);

    const startSession = useCallback(async () => {
        try {

            if (initiateResponse) {
                socket?.send(JSON.stringify({ type: "stop_recording" }))
                socket?.close(1000, 'Session ended by user');
                setSocket(null);
                console.log('Session ended by user');
            }

            const response = await initLiveSession(settings);
            setInitiateResponse(response);

            const ws = new WebSocket(response.url);

            ws.addEventListener('open', () => {
                setIsConnected(true);
                setError(null);
            });

            ws.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
                setError('WebSocket connection error');
            });

            ws.addEventListener('close', ({ code, reason }) => {
                setIsConnected(false);
                if (code !== 1000) {
                    console.error(`Connection closed with code ${code} and reason ${reason}`);
                    setError('WebSocket connection closed unexpectedly');
                }
            });

            ws.addEventListener('message', handleMessage);
            setSocket(ws);

            // Start recording with the same config as in App.tsx
            const config: RecordingConfig = {
                interval: 500,
                enableProcessing: true,
                sampleRate: 16000,
                channels: 1,
                encoding: 'pcm_16bit',
                compression: {
                    enabled: false,
                    format: 'aac',
                    bitrate: 128000
                },
                onAudioStream: async (audioData: AudioDataEvent) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'audio_chunk',
                            data: {
                                chunk: audioData.data,
                            },
                        }));
                    }
                },
                onAudioAnalysis: async () => { },
                autoResumeAfterInterruption: false
            };

            await startRecording(config);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start session');
        }
    }, [startRecording, handleMessage, settings]);

    const stopSession = useCallback(async () => {
        if (socket) {
            socket.send(JSON.stringify({ type: 'stop_recording' }));
            socket.close(1000, 'Session ended by user');
            setSocket(null);
        }
        await stopRecording();
        setIsConnected(false);
    }, [socket, stopRecording]);

    useEffect(() => {
        return () => {
            if (socket) {
                socket.close(1000, 'Component unmounted');
            }
        };
    }, [socket]);

    return {
        startSession,
        stopSession,
        isConnected,
        isRecording,
        error,
        initiateResponse,
        transcript,
        translations
    };
}