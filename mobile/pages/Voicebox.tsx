import { useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Animated,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { useSpeechRecognition } from 'hooks/useSpeechRecognation';
import { AppSettings } from 'App';

export const VoiceBox = ({ settings }: { settings: AppSettings }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const {
        translatedTexts,
        startListening,
        stopListening,
        recognizing,
        transcript
    } = useSpeechRecognition(settings);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (!recognizing) {
            startListening();
        }
    }, []);

    const turnOnListenMode = () => {
        if (recognizing) {
            stop();
        } else {
            startListening();
        }
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [translatedTexts, transcript]);

    return (
        <View className="flex flex-col h-full min-w-full bg-gray-50">
            <View className="h-full pb-8 flex flex-col justify-center px-3">
                {translatedTexts.length > 0 &&
                    translatedTexts.map((translation, index) => (
                        <View
                            key={index}
                            className="flex flex-col items-center justify-between h-2/3 text-black text-lg py-8"
                        >
                            <Text>{translation.original}</Text>
                            <Text>{translation.translation}</Text>
                            <Text>{translation.secondaryTranslation}</Text>
                            <Text>{translation.tertiaryTranslation}</Text>
                        </View>
                    ))}
            </View>

            {/* Status Bar */}
            <View className="px-4 py-3 bg-white border-t border-gray-200 absolute bottom-0 w-full">
                <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600 font-medium">
                        {recognizing
                            ? 'Listening...'
                            : transcript
                              ? 'Processing...'
                              : 'Ready to translate'}
                    </Text>

                    {recognizing && (
                        <View className="flex flex-row gap-2 items-center">
                            <Animated.View
                                style={[
                                    styles.indicator,
                                    {
                                        transform: [{ scale: pulseAnim }],
                                        opacity: pulseAnim
                                    }
                                ]}
                                className="w-3 h-3 bg-red-500 rounded-full"
                            />
                            <TouchableOpacity
                                className="bg-red-500 rounded-full p-2"
                                onPress={stopListening}
                            >
                                <Text className="text-white font-semibold">
                                    Stop
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!recognizing && (
                        <TouchableOpacity
                            className="bg-blue-500 rounded-full p-2"
                            onPress={turnOnListenMode}
                        >
                            <Text className="text-white font-semibold">
                                Start
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    indicator: {
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    }
});
