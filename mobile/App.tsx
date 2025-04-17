// App.tsx
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Settings } from 'pages/Setting';
import { VoiceBox } from 'pages/Voicebox';
import './global.css';

export interface AppSettings {
    sourceLanguage: string;
    primaryTarget: string;
    secondaryTarget?: string;
    tertiaryTarget?: string;
}

export default function App() {
    const [showSettings, setShowSettings] = useState(false);
    const [appSettings, setAppSettings] = useState<AppSettings>({
        sourceLanguage: 'en-US',
        primaryTarget: 'ms',
        secondaryTarget: 'ar',
        tertiaryTarget: 'ta'
    });

    return (
        <View className="h-screen flex-1 items-center justify-center pt-24">
            {!showSettings && (
                <TouchableOpacity
                    className="absolute top-4 right-4 z-10 p-2"
                    onPress={() => setShowSettings(true)}
                >
                    <AntDesign name="setting" size={24} color="#4a5568" />
                </TouchableOpacity>
            )}

            {showSettings ? (
                <Settings
                    initialSettings={appSettings}
                    onClose={() => setShowSettings(false)}
                    onSave={(newSettings) => {
                        setAppSettings({
                            sourceLanguage: newSettings.sourceLanguage,
                            primaryTarget: newSettings.primaryTarget,
                            secondaryTarget: newSettings.secondaryTarget,
                            tertiaryTarget: newSettings.tertiaryTarget
                        });
                        setShowSettings(false);
                    }}
                />
            ) : (
                <View>
                    <VoiceBox settings={appSettings} />
                </View>
            )}
            <StatusBar style="auto" />
        </View>
    );
}
