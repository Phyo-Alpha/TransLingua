import { View, Modal, Button, StyleSheet } from 'react-native';
import useGladiaSpeechRecognation from './hooks/useGladiaSpeechRecognation';
import { ExpoAudioStreamModule } from '@siteed/expo-audio-studio';
import TranscriptionPage from './pages/TranscriptionPage';
import { useEffect, useState, useCallback } from 'react';
import StatusBar from './components/StatusBar';
import { Settings } from './pages/Setting';
import { LanguageSettings, SessionState } from 'types';
import Toast from 'react-native-toast-message';

const DEFAULT_SETTINGS: LanguageSettings = {
  firstLanguage: 'en',
  secondLanguage: 'ms',
  thirdLanguage: 'ar',
  fourthLanguage: 'ta'
};

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<LanguageSettings>(DEFAULT_SETTINGS);
  const [sessionState, setSessionState] = useState<SessionState>('Idle');
  const [isStatusBarVisible, setIsStatusBarVisible] = useState(true);

  const {
    startSession,
    stopSession,
    isLoading,
    isConnected,
    isRecording,
    error,
    transcript,
    translations
  } = useGladiaSpeechRecognation(settings);

  // Request microphone permission with user feedback
  const requestPermission = useCallback(async () => {
    const { granted } = await ExpoAudioStreamModule.requestPermissionsAsync();
    if (granted) {
      setPermissionGranted(true);
      Toast.show({
        type: 'success',
        text1: 'Permission Granted',
        text2: 'Starting Session.'
      });
      startSession();
    } else {
      setPermissionGranted(false);
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Microphone access is required. Please enable it in settings.'
      });
    }
  }, []);

  // Request permission on mount, but don't start the session automatically
  useEffect(() => {
    requestPermission();
  }, []);

  // Update session state for UI feedback
  useEffect(() => {
    if (isConnected) {
      setSessionState('Connected');
    } else if (isRecording) {
      setSessionState('Recording');
    } else {
      setSessionState('Idle');
    }
  }, [isConnected, isRecording]);

  // Handle settings save with change detection and feedback
  const handleSaveSettings = useCallback(
    (newSettings: LanguageSettings) => {
      if (JSON.stringify(newSettings) !== JSON.stringify(settings)) {
        setSettings(newSettings);
        Toast.show({
          type: 'success',
          text1: 'Settings Saved',
          text2: 'Session will restart with new settings.'
        });
        if (isConnected || isRecording) {
          stopSession().then(() => startSession());
        }
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Changes',
          text2: 'Settings remain the same.'
        });
      }
      setShowSettings(false);
    },
    [settings, isConnected, isRecording, stopSession, startSession]
  );

  const toggleStatusBarVisibility = () => {
    setIsStatusBarVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Transcription Page */}
      <TranscriptionPage
        transcript={transcript}
        translations={translations}
        onSettingsPress={() => setShowSettings(true)}
      />

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <Settings
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialSettings={settings}
        />
      </Modal>

      {/* Retry Permission Button */}
      {!permissionGranted && (
        <View style={styles.retryContainer}>
          <Button
            title="Retry Permission Request"
            onPress={requestPermission}
          />
        </View>
      )}
      {/* Status Bar with session state */}
      <StatusBar
        sessionState={sessionState}
        isConnected={isConnected}
        isRecording={isRecording}
        error={error}
        permissionGranted={permissionGranted}
        onStartSession={startSession}
        onStopSession={stopSession}
        isLoading={isLoading}
        isVisible={isStatusBarVisible}
        onToggleVisibility={toggleStatusBarVisibility}
      />
      <Toast />
    </View>
  );
}

// Basic styles for layout
const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', height: '100%' },
  retryContainer: { marginTop: 20 }
});
