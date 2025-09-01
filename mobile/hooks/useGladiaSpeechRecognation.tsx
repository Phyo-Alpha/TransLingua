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
import { languagesLabel } from './languages';
import { printMessage, setResponse } from './helpers';
import { useSettings } from './settings';

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
  ].filter(Boolean) as string[];

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
    throw new Error(
      `Failed to initialize live session: ${response.status} ${response.statusText}`
    );
  }

  const initiateResponse = await response.json();
  return initiateResponse;
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

export default function useGladiaSpeechRecognition() {
  const { settings } = useSettings();
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
          setTranslations,
          maxWordsCountBeforeReset: settings.maxWordsCountBeforeReset
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
    console.log('=== Starting Session ===');
    console.log('isConnected:', isConnected);
    console.log('isRecording:', isRecording);
    console.log('socket:', socket ? 'exists' : 'null');

    if (isConnected || isRecording) {
      console.log('Session Already Active, Stopping it');
      await stopSession();
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
        interval: 500,
        enableProcessing: true,
        sampleRate: 16000,
        channels: 1,
        encoding: 'pcm_16bit',
        features: {
          energy: true, // Overall audio energy
          rms: true, // Root mean square (amplitude)
          zcr: true, // Zero crossing rate (speech vs noise)
          spectralCentroid: true, // Brightness of sound
          pitch: true // Fundamental frequency
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
        onAudioAnalysis: async (event) => {
          // detectVoice(event);
        },
        autoResumeAfterInterruption: false
      };

      await startRecording(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  }, [startRecording, handleMessage, settings]);

  const stopSession = async () => {
    if (socket === null || !isConnected) {
      Toast.show({
        type: 'info',
        text1: 'No active session',
        text2: `Please start a session before stopping it. ${socket ? 'socket exists' : 'socket null'}, Connection Status:  ${isConnected ? 'is connected' : 'is not connected'}`
      });
      return;
    }
    try {
      await stopRecording();
      setIsConnected(false);
      setIsLoading(false);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'stop_recording' }));
        socket.close(1000, 'Session ended by user');
        setSocket(null);
        setInitiateResponse(null);
      } else {
        console.error('WebSocket is not opened');
        setError('Web socket is not opened');
      }
    } catch (err) {
      setError('Failed to stop session');
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounted');
        setSocket(null);
      }
      console.log('Stopping Recording on socket unmount');
      stopRecording().catch(() => {
        // ignore error on stopping recording
      });
    };
  }, [socket]);

  const reset = useCallback(async () => {
    try {
      await stopSession();
    } catch (err) {
      console.error('Error stopping session:', err);
      try {
        await stopRecording();
      } catch (stopErr) {
        console.error('Failed to stop recording during reset', stopErr);
      }
    }
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
