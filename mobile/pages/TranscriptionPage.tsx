import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { TranscriptResponse, TranslationResponse } from 'types';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from 'hooks/settings';

interface TranscriptionPageProps {
  transcript: TranscriptResponse | null;
  translations: TranslationResponse[];
  onSettingsPress: () => void;
}

// Seven dots separator component
const SevenDotsSeparator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separatorLine} />
    <View style={styles.dotsContainer}>
      {[...Array(7)].map((_, index) => (
        <View key={index} style={styles.dot} />
      ))}
    </View>
    <View style={styles.separatorLine} />
  </View>
);

export default function TranscriptionPage({
  transcript,
  translations,
  onSettingsPress
}: TranscriptionPageProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const { settings } = useSettings();

  const usedTranslationsCount =
    Object.values(settings).filter(Boolean).length - 1; // -1 to not count the max words settings

  // Auto-scroll to bottom when new translations are added
  useEffect(() => {
    if (translations.length > 0) {
      // Use setTimeout to ensure the content has been rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [translations.length]); // Use translations.length for better performance

  // Render translations with separators
  const renderTranslationsWithSeparators = () => {
    return translations.map((translation, index) => (
      <React.Fragment key={index}>
        <Text style={styles.text}>{translation.translation}</Text>
        {(index + 1) % usedTranslationsCount === 0 &&
          index < translations.length - 1 && <SevenDotsSeparator />}
      </React.Fragment>
    ));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={24} color="#333" />
      </TouchableOpacity>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        automaticallyAdjustKeyboardInsets={true}
      >
        {translations.length > 0 && <>{renderTranslationsWithSeparators()}</>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: '100%'
  },
  scrollView: {
    flex: 1,
    paddingVertical: 48,
    paddingHorizontal: 16
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 120
  },
  section: {
    marginBottom: 24
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
    paddingHorizontal: 20
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
    opacity: 0.6
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    marginHorizontal: 2,
    opacity: 0.8
  }
});
