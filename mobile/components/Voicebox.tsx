import { useSpeechRecognition } from 'hooks/useSpeechRecognation';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export const VoiceBox = () => {
    const {
        transcript,
        translatedText,
        error,
        recognizing,
        startListening,
        stopListening
    } = useSpeechRecognition();

    // Animation values
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(20);

    // Animate when translated text changes
    Animated.parallel([
        Animated.spring(fadeAnim, {
            toValue: 1,
            useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true
        })
    ]).start();

    return (
        <View className="bg-green-500 flex-1 w-full items-center justify-between py-20">
            {/* Debug Info */}
            <View className="w-full max-w-md bg-black/30 rounded-2xl p-6">
                {/* Debug Info */}
                <Text className="text-white text-lg font-semibold mb-2">
                    Debug Info
                </Text>
                <Text className="text-gray-400 text-sm mb-4">
                    {JSON.stringify(
                        { transcript, translatedText, error, recognizing },
                        null,
                        2
                    )}
                </Text>
            </View>

            <Text className="text-5xl text-white font-semibold mb-2 px-6">
                {translatedText}
            </Text>

            <TouchableOpacity
                onPress={recognizing ? stopListening : startListening}
                className="w-20 h-20 bg-red-500 rounded-full items-center justify-center shadow-xl"
            >
                <MaterialIcons name="mic" size={32} color="white" />
            </TouchableOpacity>

            {/* Error Display */}
            {error && (
                <Text className="text-red-400 text-center mt-4">{error}</Text>
            )}
        </View>
    );
};
