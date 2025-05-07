import { View, Modal } from 'react-native';
import useGladiaSpeechRecognation from './hooks/useGladiaSpeechRecognation';
import {
    ExpoAudioStreamModule,
} from '@siteed/expo-audio-studio'
import TranscriptionPage from './pages/TranscriptionPage';
import { useEffect, useState } from 'react';
import StatusBar from './components/StatusBar';
import { Settings } from './pages/Setting';
import { LanguageSettings } from 'types';

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

    const {
        startSession,
        stopSession,
        isConnected,
        isRecording,
        error,
        transcript,
        translations
    } = useGladiaSpeechRecognation(settings);

    useEffect(() => {
        const initialize = async () => {
            const { granted } = await ExpoAudioStreamModule.requestPermissionsAsync();
            if (granted) {
                console.log('Microphone permission granted')
                setPermissionGranted(true);
                await startSession();
            } else {
                console.log('Microphone permission denied')
            }
        }
        initialize();
    }, [])

    const handleSaveSettings = (newSettings: LanguageSettings) => {
        setSettings(newSettings);
        setShowSettings(false);
        // Restart session with new settings
        stopSession().then(() => startSession());
    };

    return (
        <View style={{ flex: 1 }}>
            <TranscriptionPage
                transcript={transcript}
                translations={translations}
                onSettingsPress={() => setShowSettings(true)}
            />
            <StatusBar
                isConnected={isConnected}
                isRecording={isRecording}
                error={error}
                permissionGranted={permissionGranted}
            />
            <Modal
                visible={showSettings}
                animationType="slide"
                transparent={true}
            >
                <Settings
                    onClose={() => setShowSettings(false)}
                    onSave={handleSaveSettings}
                    initialSettings={settings}
                />
            </Modal>
        </View>
    );
}
