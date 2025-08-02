// components/Settings.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LanguageSettings } from 'types';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Malay' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ta', name: 'Tamil' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'bn', name: 'Bengali' }
];

export const Settings = ({
  onClose,
  onSave,
  initialSettings
}: {
  onClose: () => void;
  onSave: (settings: LanguageSettings) => void;
  initialSettings: LanguageSettings;
}) => {
  const [settings, setSettings] = useState<LanguageSettings>(initialSettings);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Language Settings</Text>

        <View style={styles.settingGroup}>
          <Text style={styles.label}>First Language</Text>
          <Picker
            selectedValue={settings.firstLanguage}
            onValueChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                firstLanguage: value
              }))
            }
          >
            {LANGUAGES.map((lang) => (
              <Picker.Item
                key={lang.code}
                label={lang.name}
                value={lang.code}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.label}>Second Language</Text>
          <Picker
            selectedValue={settings.secondLanguage}
            onValueChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                secondLanguage: value
              }))
            }
          >
            <Picker.Item label="None" value="none" />
            {LANGUAGES.map((lang) => (
              <Picker.Item
                key={lang.code}
                label={lang.name}
                value={lang.code}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.label}>Third Language</Text>
          <Picker
            selectedValue={settings.thirdLanguage}
            onValueChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                thirdLanguage: value
              }))
            }
          >
            <Picker.Item label="None" value="none" />
            {LANGUAGES.map((lang) => (
              <Picker.Item
                key={lang.code}
                label={lang.name}
                value={lang.code}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.label}>Fourth Language</Text>
          <Picker
            selectedValue={settings.fourthLanguage}
            onValueChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                fourthLanguage: value
              }))
            }
          >
            <Picker.Item label="None" value="none" />
            {LANGUAGES.map((lang) => (
              <Picker.Item
                key={lang.code}
                label={lang.name}
                value={lang.code}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={() => onSave(settings)}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    width: '100%',
    height: '100%'
  },
  scrollContainer: {
    paddingBottom: 40
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a365d'
  },
  settingGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  button: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4
  },
  saveButton: {
    backgroundColor: '#4299e1'
  },
  buttonText: {
    textAlign: 'center',
    color: '#1a365d',
    fontWeight: '600'
  }
});
