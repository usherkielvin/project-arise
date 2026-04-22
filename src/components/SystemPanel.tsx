/**
 * SystemPanel — The base "System Window" frame used throughout Project Arise.
 * Draws corner bracket decorators and a subtle glowing border. 
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SystemPanelProps {
  children: React.ReactNode;
  label?: string;           // Optional top-left label, e.g. "STATUS"
  style?: ViewStyle;
  noPadding?: boolean;
}

const CORNER = 10; // corner bracket size

export function SystemPanel({ children, label, style, noPadding }: SystemPanelProps) {
  const { colors: C } = useTheme();
  const styles = getStyles(C);

  return (
    <View style={[styles.wrapper, style]}>
      {/* ── Corner Brackets ── */}
      <View style={[styles.corner, styles.TL]} />
      <View style={[styles.corner, styles.TR]} />
      <View style={[styles.corner, styles.BL]} />
      <View style={[styles.corner, styles.BR]} />

      {/* Optional header label */}
      {label && (
        <View style={styles.labelWrap}>
          <View style={styles.labelLine} />
          <Text style={styles.labelText}>{label}</Text>
          <View style={styles.labelLine} />
        </View>
      )}

      <View style={noPadding ? undefined : styles.inner}>
        {children}
      </View>
    </View>
  );
}

const getStyles = (C: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: C.blueBorder,
    borderRadius: 8,
    backgroundColor: C.surface,
    position: 'relative',
  },
  inner: {
    padding: 16,
  },
  // Shared corner style
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    zIndex: 10,
  },
  TL: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
    borderColor: C.blue,
  },
  TR: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 8,
    borderColor: C.blue,
  },
  BL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 8,
    borderColor: C.blue,
  },
  BR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 8,
    borderColor: C.blue,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: -7,
    marginBottom: 0,
    zIndex: 20,
  },
  labelLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.blueBorder,
  },
  labelText: {
    color: C.blue,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginHorizontal: 6,
    backgroundColor: C.surface,
    paddingHorizontal: 4,
  },
});
