import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  backgroundColor: string;
  borderColor: string;
  style?: ViewStyle | ViewStyle[];
};

export function SectionCard({ children, backgroundColor, borderColor, style }: Props) {
  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
});
