import { useSpeechRecognition } from 'hooks/useSpeechRecognation';
import { View, Text, Button } from 'react-native';

export const VoiceBox = () => {
    const { transcript, error, recognizing, startListening, stopListening } =
        useSpeechRecognition();

    return (
        <View>
            <Text>
                {JSON.stringify({ transcript, error, recognizing }, null, 2)}
            </Text>
            <Text>{transcript}</Text>
            {recognizing ? (
                <Button title="Stop" onPress={stopListening} />
            ) : (
                <Button title="Start" onPress={startListening} />
            )}
        </View>
    );
};
