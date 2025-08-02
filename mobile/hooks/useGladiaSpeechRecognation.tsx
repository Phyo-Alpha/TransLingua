import { useEffect, useState, useCallback } from 'react';
import {
  InitiateResponse,
  LanguageSettings,
  ServerMessage,
  StreamingAudioFormat,
  StreamingConfig,
  TranscriptResponse,
  TranslationResponse
} from 'types';
import Toast from 'react-native-toast-message';
import {
  useAudioRecorder,
  RecordingConfig,
  AudioDataEvent
} from '@siteed/expo-audio-studio';
import { formatSeconds } from './helpers';

const GLADIA_AUDIO_FORMAT: StreamingAudioFormat = {
  encoding: 'wav/pcm',
  bit_depth: 16,
  sample_rate: 16_000,
  channels: 1
};

async function initLiveSession(settings: LanguageSettings) {
  const gladiaApiUrl = process.env.EXPO_PUBLIC_GLADIA_API_URL;
  const gladiaKey = process.env.EXPO_PUBLIC_GLADIA_API_KEY;

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
    body: JSON.stringify({ ...GLADIA_AUDIO_FORMAT, ...config })
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
}
function setResponse({
  message,
  translations,
  setTranscript,
  setTranslations
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
      // Convert previous translations to a map
      const translationsMap = new Map(
        prevTranslations.map((t: TranslationResponse) => [t.language, t])
      );

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

async function waitForWebSocket(ws: WebSocket) {
  try {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout after 10 seconds'));
      }, 10000); // wait for 10 seconds for web socket to connect before rejecting and throwing error

      const checkReady = () => {
        if (ws.readyState === WebSocket.OPEN) {
          clearTimeout(timeout);
          resolve();
        } else if (
          ws.readyState === WebSocket.CLOSED ||
          ws.readyState === WebSocket.CLOSING
        ) {
          clearTimeout(timeout);
          reject(new Error('WebSocket failed to connect'));
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default function useGladiaSpeechRecognition(settings: LanguageSettings) {
  const [initiateResponse, setInitiateResponse] =
    useState<InitiateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [translations, setTranslations] = useState<TranslationResponse[]>([]);

  const { startRecording, stopRecording, isRecording } = useAudioRecorder();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data.toString());
        printMessage(message);
        setResponse({
          message,
          translations,
          setTranscript,
          setTranslations
        });
      } catch (err) {
        console.error('Error parsing message:', err);
        setError(
          `Error parsing server response ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    },
    [translations, setTranscript, setTranslations]
  );

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        position: 'top',
        visibilityTime: 4000
      });
    }
  }, [error]);

  const startSession = useCallback(async () => {
    if (isConnected || isRecording) {
      Toast.show({
        type: 'info',
        text1: 'Session already active',
        text2: 'Please stop the current session before starting a new one'
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscript(null);
    setTranslations([]);

    try {
      if (initiateResponse) {
        socket?.send(JSON.stringify({ type: 'stop_recording' }));
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
        Toast.show({
          type: 'success',
          text1: 'Session Started',
          text2: 'Speech recognition session is active'
        });
      });

      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      });

      ws.addEventListener('close', ({ code, reason }) => {
        setIsConnected(false);
        if (code !== 1000) {
          console.error(
            `Connection closed with code ${code} and reason ${reason}`
          );
          setError(
            'WebSocket connection closed unexpectedly. Attempting to Reconnect'
          );
        }
      });

      ws.addEventListener('message', handleMessage);
      setSocket(ws);

      await waitForWebSocket(ws);

      // Start recording with the same config as in App.tsx
      const config: RecordingConfig = {
        interval: 1000,
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
            try {
              ws.send(
                JSON.stringify({
                  type: 'audio_chunk',
                  data: {
                    chunk: audioData.data
                  }
                })
              );
            } catch (err) {
              console.error('Error sending audio chunk:', err);
              setError('Failed to send audio data');
            }
          }
        },
        onAudioAnalysis: async () => {},
        autoResumeAfterInterruption: false
      };

      await startRecording(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  }, [startRecording, handleMessage, settings]);

  const stopSession = useCallback(async () => {
    if (socket === null || isConnected) {
      Toast.show({
        type: 'info',
        text1: 'No active session',
        text2: 'Please start a session before stopping it'
      });
      return;
    }
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'stop_recording' }));
        socket.close(1000, 'Session ended by user');
        setSocket(null);
      } else {
        console.error('WebSocket is not opened');
        setError('Web socket is not opened');
      }
      await stopRecording();
      setIsConnected(false);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to stop session');
    }
  }, [socket, stopRecording]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounted');
        setSocket(null);
      }
      stopRecording().catch(() => {
        // ignore error on stopping recording
      });
    };
  }, [socket]);

  const reset = useCallback(() => {
    stopSession();
    setInitiateResponse(null);
    setTranscript(null);
    setTranslations([]);
    setError(null);
  }, [stopSession]);

  return {
    startSession,
    stopSession,
    isConnected,
    reset,
    isLoading,
    isRecording,
    error,
    initiateResponse,
    transcript,
    translations
  };
}
