import { View, Modal, Button, StyleSheet } from 'react-native';
import useGladiaSpeechRecognation from './hooks/useGladiaSpeechRecognation';
import { ExpoAudioStreamModule } from '@siteed/expo-audio-studio';
import TranscriptionPage from './pages/TranscriptionPage';
import { useEffect, useState, useCallback } from 'react';
import StatusBar from './components/StatusBar';
import { Settings } from './pages/Setting';
import Toast from 'react-native-toast-message';
import { LanguageSettings, SessionState } from 'types';
import { SettingsProvider, useSettings } from './hooks/settings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function AppContent() {
  const { settings, setSettings } = useSettings();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
  } = useGladiaSpeechRecognation();

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
      setSettings(newSettings);
      console.log('New settings', newSettings);
      Toast.show({
        type: 'success',
        text1: 'Settings Saved',
        text2: 'Language Setting Changes. Restarting in five seconds',
        visibilityTime: 6000
      });
      if (isConnected || isRecording) {
        stopSession().then(() => {
          setTimeout(() => {
            console.log('Starting Session with new settings');
            startSession().catch((err) => {
              console.error('Error starting session with new settings', err);
              Toast.show({
                type: 'error',
                text1: 'Auto Session Start Failed!',
                text2: 'Please manually start the session from status bar'
              });
            });
          }, 5000);
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
    <GestureHandlerRootView>
      <View style={styles.container}>
        <TranscriptionPage
          transcript={transcript}
          response={translations}
          onSettingsPress={() => setShowSettings(true)}
        />

        <Modal visible={showSettings} animationType="slide" transparent={true}>
          <Settings
            onClose={() => setShowSettings(false)}
            onSave={handleSaveSettings}
          />
        </Modal>

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
    </GestureHandlerRootView>
  );
}

// Basic styles for layout
const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', height: '100%' },
  retryContainer: { marginTop: 20 }
});
