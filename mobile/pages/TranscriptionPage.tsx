import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TranscriptResponse, TranslationResponse } from 'types';
import { Ionicons } from '@expo/vector-icons';

interface TranscriptionPageProps {
    transcript: TranscriptResponse | null;
    translations: TranslationResponse[];
    onSettingsPress: () => void;
}

export default function TranscriptionPage({ transcript, translations, onSettingsPress }: TranscriptionPageProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={onSettingsPress}
            >
                <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
            >
                {translations.length > 0 && (
                    <>
                        {translations.map((translation, index) => (
                            <Text key={index} style={styles.text}>
                                {translation.translation}
                            </Text>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        height: '100%',
    },
    scrollView: {
        flex: 1,
        paddingVertical: 48,
        paddingHorizontal: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 100,
    },
    section: {
        marginBottom: 24,
    },
    text: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    settingsButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
        padding: 8,
    },
}); 