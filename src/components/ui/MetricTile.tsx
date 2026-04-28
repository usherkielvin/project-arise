import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { F } from '../../theme/fonts';

type Props = {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
  backgroundColor: string;
  borderColor: string;
};

export function MetricTile({
  label,
  value,
  labelColor,
  valueColor,
  backgroundColor,
  borderColor,
}: Props) {
  return (
    <View style={[styles.metric, { backgroundColor, borderColor }]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, gap: 4 },
  label: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase' },
  value: { fontFamily: F.semiBold, fontSize: 16 },
});
