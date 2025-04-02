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

    const { translatedTexts, recognizing, startListening, setState } =
        useSpeechRecognition();

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
        <View className="bg-black flex-1 w-full items-center py-20 px-4">
            {/* Language Toggle */}
            <Animated.View
                style={[styles.toggleContainer, { opacity: fadeAnim }]}
                className="absolute top-10 right-6 flex-row items-center"
            >
                <TouchableOpacity
                    onPress={handleLanguageToggle}
                    className="flex-row items-center bg-gray-800/60 rounded-full px-4 py-2"
                >
                    <Text className="text-white font-semibold mr-2">
                        {isEnToMs ? 'EN → MS' : 'MS → EN'}
                    </Text>
                    <MaterialIcons
                        name="swap-horiz"
                        size={24}
                        color="#4f46e5"
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* Translations List */}
            <View className="w-full max-w-2xl mt-16">
                {translatedTexts.map((translatedText, index) => (
                    <View
                        key={index}
                        className="w-full mb-4 bg-gray-800/40 rounded-2xl p-6"
                        style={styles.translationCard}
                    >
                        {/* Language Direction Badge */}
                        <View className="absolute -top-3 right-4 bg-indigo-600 px-3 py-1 rounded-full">
                            <Text className="text-xs text-white font-bold">
                                {isEnToMs ? 'EN → MS' : 'MS → EN'}
                            </Text>
                        </View>

                        <Text className="text-lg text-white font-medium leading-relaxed">
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
