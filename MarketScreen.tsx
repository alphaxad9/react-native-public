import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

export default function MarketScreen({ route }: { route: any }) {
  const { name } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { marginBottom: 16, color: '#666' },
  price: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
});