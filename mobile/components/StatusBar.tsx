import React, { ComponentPropsWithoutRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SessionState } from 'types';

const GREEN_COLOR = '#22c55e'; // Tailwind green-500
const RED_COLOR = '#ef4444'; // Tailwind red-500

interface StatusBadgeProps {
  icon: ComponentPropsWithoutRef<typeof MaterialIcons>['name'];
  label: string;
  active: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ icon, label, active }) => {
  const textColor = active ? GREEN_COLOR : RED_COLOR;
  return (
    <View style={styles.badgeContainer}>
      <MaterialIcons name={icon} size={16} color={textColor} />
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

interface StatusBarProps {
  sessionState: SessionState;
  isConnected: boolean;
  isRecording: boolean;
  error: string | null;
  permissionGranted: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  isLoading?: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export default function StatusBar({
  sessionState,
  isConnected,
  isRecording,
  error,
  permissionGranted,
  onStartSession,
  onStopSession,
  isLoading = false,
  isVisible,
  onToggleVisibility
}: StatusBarProps) {
  if (!isVisible) {
    return (
      <TouchableOpacity
        style={error ? styles.toggleButtonError : styles.toggleButton}
        onPress={onToggleVisibility}
      >
        <MaterialIcons
          name={error ? 'error' : 'router'}
          size={24}
          color={error ? '#DC2626' : '#333'}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.statusBarContainer}>
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorHeader}>
            <MaterialIcons name="error-outline" size={20} color="#DC2626" />
            <Text style={styles.errorTitle}>Connection Error</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onStartSession}
              disabled={isLoading}
            >
              <MaterialIcons name="refresh" size={16} color="#DC2626" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Toggle button to hide status bar */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={onToggleVisibility}
      >
        <MaterialIcons name="close" size={24} color="#333" />
      </TouchableOpacity>

      {/* Status badges with flex-wrap */}
      <View style={styles.statusBarInner}>
        <View style={styles.badgesContainer}>
          <StatusBadge
            icon="wifi-find"
            label={sessionState}
            active={sessionState === 'Connected'}
          />
          <StatusBadge
            icon="wifi"
            label={isConnected ? 'Connected' : 'Disconnected'}
            active={isConnected}
          />
          <StatusBadge
            icon="mic"
            label={isRecording ? 'Recording' : 'Not Recording'}
            active={isRecording}
          />
          <StatusBadge
            icon="check-circle"
            label={permissionGranted ? 'Permission Granted' : 'No Permission'}
            active={permissionGranted}
          />
        </View>

        {/* Session control buttons */}
        {/* <View style={styles.buttonContainer}>
          <Button
            title="Start Session"
            onPress={onStartSession}
            disabled={isLoading || isConnected || !permissionGranted}
          />
          <Button
            title="Stop Session"
            onPress={onStopSession}
            disabled={!isConnected}
          />
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
    marginVertical: 2
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 14
  },
  statusBarContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // gray-200
    padding: 8
  },
  statusBarInner: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20
  },
  toggleButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    zIndex: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  toggleButtonError: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#FEE2E2', // red-100
    borderRadius: 20,
    zIndex: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5' // red-300
  },
  errorContainer: {
    backgroundColor: '#FEF2F2', // red-50
    borderWidth: 1,
    borderColor: '#FECACA', // red-200
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  errorTitle: {
    color: '#DC2626', // red-600
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  errorText: {
    color: '#991B1B', // red-800
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2', // red-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5' // red-300
  },
  retryButtonText: {
    color: '#DC2626', // red-600
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  }
});
