import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBarProps {
    isConnected: boolean;
    isRecording: boolean;
    error: string | null;
    permissionGranted: boolean;
}

export default function StatusBar({ isConnected, isRecording, error, permissionGranted }: StatusBarProps) {
    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#FFA000' }]} />
                    <Text style={styles.statusText}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                </View>

                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: isRecording ? '#4CAF50' : '#F44336' }]} />
                    <Text style={styles.statusText}>
                        {isRecording ? 'Recording' : 'Not Recording'}
                    </Text>
                </View>

                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: permissionGranted ? '#4CAF50' : '#F44336' }]} />
                    <Text style={styles.statusText}>
                        {permissionGranted ? 'Permission Granted' : 'No Permission'}
                    </Text>
                </View>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        padding: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#666',
    },
    errorContainer: {
        marginTop: 4,
        paddingHorizontal: 8,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        textAlign: 'center',
    },
});
