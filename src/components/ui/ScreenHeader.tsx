import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { F } from '../../theme/fonts';

type Props = {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
};

export function ScreenHeader({ title, subtitle, titleColor, subtitleColor }: Props) {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 24, gap: 4 },
  title: { fontFamily: F.bold, fontSize: 34, letterSpacing: -1 },
  subtitle: { fontFamily: F.regular, fontSize: 13 },
});
