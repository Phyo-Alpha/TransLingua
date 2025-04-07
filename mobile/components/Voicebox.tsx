import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Switch,
    StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSpeechRecognition } from 'hooks/useSpeechRecognation';

export const VoiceBox = () => {
    const [isEnToMs, setIsEnToMs] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(1));

    const {
        translatedTexts,
        recognizing,
        transcript,
        startListening,
        setState
    } = useSpeechRecognition();

    const handleLanguageToggle = () => {
        if (!isEnToMs) {
            setState((prev) => ({
                ...prev,
                sourceLanguage: 'en-US',
                targetLanguage: 'ms'
            }));
        } else {
            setState((prev) => ({
                ...prev,
                sourceLanguage: 'ms',
                targetLanguage: 'en-US'
            }));
        }

        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            setIsEnToMs(!isEnToMs);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            }).start();
        });
    };

    useEffect(() => {
        if (!recognizing) {
            startListening();
        }
    }, []);

    return (
        <View className="bg-white flex-1 w-full items-center py-20 px-4">
            {/* Translations List */}
            <View className="w-full max-w-2xl mt-16">
                {translatedTexts.map((translatedText, index) => (
                    <View>
                        <Text className='className="text-3xl text-black font-medium leading-relaxed"'>
                            {transcript}
                        </Text>
                        <Text
                            key={index}
                            className="text-3xl text-black font-medium leading-relaxed"
                        >
                            {translatedText}
                        </Text>
                    </View>
                ))}
            </View>

            {/* ... rest of your existing components ... */}
        </View>
    );
};

const styles = StyleSheet.create({
    toggleContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    translationCard: {
        borderWidth: 1,
        borderColor: '#ffffff10',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4
    }
});
