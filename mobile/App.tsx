import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';

import './global.css';
import { View } from 'react-native';
import { VoiceBox } from 'components/Voicebox';

export default function App() {
    return (
        <View className="h-screen flex-1 items-center justify-center">
            <VoiceBox />
            <StatusBar style="auto" />
        </View>
    );
}
