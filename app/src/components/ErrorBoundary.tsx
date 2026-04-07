import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme';
import { AlertCircleIcon } from './Icons';

// Sentry integration: automatically reports errors when @sentry/react-native
// is installed and initialized. Falls back to console logging otherwise.
// See /Users/jakehaggard/Desktop/Sentry_Setup_Guide.md for setup instructions.
let Sentry: any = null;
try {
  Sentry = require('@sentry/react-native');
} catch {
  // @sentry/react-native not installed — Sentry reporting disabled
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reports an error to the appropriate destination based on environment.
 * In development, logs to the console. In production, sends to Sentry
 * if configured, otherwise logs to the console as a fallback.
 */
function reportError(error: Error, info?: ErrorInfo): void {
  if (__DEV__) {
    console.error('[ErrorBoundary] Caught:', error, info);
  } else if (Sentry) {
    Sentry.captureException(error, {
      extra: {
        componentStack: info?.componentStack,
      },
    });
  } else {
    // Fallback when Sentry is not configured
    console.error('[ErrorBoundary] Production error:', error.message);
  }
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReportIssue = () => {
    const { error } = this.state;
    const subject = encodeURIComponent('ConnectMe App Crash Report');
    const body = encodeURIComponent(
      `Hi ConnectMe Support,\n\nI encountered an error in the app.\n\nError: ${error?.message ?? 'Unknown error'}\nStack: ${error?.stack ?? 'N/A'}\n\nPlease let me know if you need more information.`
    );
    Linking.openURL(`mailto:support@connectmeapp.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <AlertCircleIcon size={36} color={colors.error} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app ran into an unexpected error. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportButton} onPress={this.handleReportIssue}>
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background, alignItems: 'center',
    justifyContent: 'center', padding: spacing.xl,
  },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: spacing.lg },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: spacing.sm },
  message: {
    fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
  reportButton: {
    marginTop: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
  },
  reportButtonText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
});
