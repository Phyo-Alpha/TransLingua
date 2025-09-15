import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { TranscriptResponse, TranslationResponse } from 'types';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

interface TranscriptionPageProps {
  transcript: TranscriptResponse | null;
  response: TranslationResponse[];
  onSettingsPress: () => void;
}

// Carousel item component for each translation section
const CarouselItem = ({ item }: { item: TranslationResponse }) => (
  <View style={styles.carouselItem}>
    {item.translations.map((translation, index) => (
      <Text key={`${item.sectionNumber}-${index}`} style={styles.text}>
        {translation.translation}
      </Text>
    ))}
  </View>
);

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
  response,
  onSettingsPress
}: TranscriptionPageProps) {
  const progress = useSharedValue<number>(0);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const carouselRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Auto scroll to last item when new translations are added
  useEffect(() => {
    if (response.length > 0 && carouselRef.current) {
      setTimeout(() => {
        carouselRef.current?.scrollTo({
          index: response.length - 1,
          animated: true
        });
        setCurrentIndex(response.length - 1);
      }, 300);
    }
  }, [response.length]);

  // Render carousel item
  const renderCarouselItem = ({ item }: { item: TranslationResponse }) => (
    <CarouselItem item={item} />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={24} color="#333" />
      </TouchableOpacity>

      {response.length > 0 ? (
        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            data={response}
            width={windowWidth}
            height={windowHeight - 100} // Account for settings button and padding
            loop={false}
            pagingEnabled={true}
            snapEnabled={true}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50
            }}
            onProgressChange={progress}
            onSnapToItem={(index) => setCurrentIndex(index)}
            renderItem={renderCarouselItem}
            style={styles.carousel}
            vertical
          />

          {/* Page Indicator */}
          {response.length > 1 && (
            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                {currentIndex + 1} / {response.length}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No translations yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: '100%'
  },
  carouselContainer: {
    flex: 1,
    paddingTop: 20 // Space for settings button
  },
  carousel: {
    width: '100%'
  },
  carouselItem: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  text: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    fontWeight: '400'
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 20
  },
  pageIndicatorText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  // Keep separator styles for potential future use
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
