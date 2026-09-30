// App.tsx
import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";

type Product = {
  id: string;
  name: string;
  amount: number;
};

const PRODUCTS: Product[] = [
  { id: "1", name: "Avocade", amount: 300 },
  { id: "2", name: "Beans", amount: 1200 },
  { id: "3", name: "Maize", amount: 700 },
];

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.amount}>{item.amount} RWF</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#E8F3EC",
  },
  name: { fontSize: 16, fontWeight: "600" },
  amount: { fontSize: 16, fontWeight: "bold", color: "#2E7D32" },
});