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

interface LanguageSettings {
    sourceLanguage: string;
    primaryTarget: string;
    secondaryTarget?: string;
    tertiaryTarget?: string;
}

const LANGUAGES = [
    { code: 'en-US', name: 'English' },
    { code: 'ms', name: 'Malay' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ta', name: 'Tamil' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }
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
                    <Text style={styles.label}>Speaker Language</Text>
                    <Picker
                        selectedValue={settings.sourceLanguage}
                        onValueChange={(value) =>
                            setSettings((prev) => ({
                                ...prev,
                                sourceLanguage: value
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
                    <Text style={styles.label}>Primary Translation</Text>
                    <Picker
                        selectedValue={settings.primaryTarget}
                        onValueChange={(value) =>
                            setSettings((prev) => ({
                                ...prev,
                                primaryTarget: value
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
                    <Text style={styles.label}>Secondary Translation</Text>
                    <Picker
                        selectedValue={settings.secondaryTarget}
                        onValueChange={(value) =>
                            setSettings((prev) => ({
                                ...prev,
                                secondaryTarget: value
                            }))
                        }
                    >
                        <Picker.Item label="None" value={undefined} />
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
                    <Text style={styles.label}>Tertiary Translation</Text>
                    <Picker
                        selectedValue={settings.tertiaryTarget}
                        onValueChange={(value) =>
                            setSettings((prev) => ({
                                ...prev,
                                tertiaryTarget: value
                            }))
                        }
                    >
                        <Picker.Item label="None" value={undefined} />
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
