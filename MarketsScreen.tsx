import { FlatList, Pressable, Text, StyleSheet, View } from 'react-native';

const MARKETS = ['Musanze-Goico', 'Kinigi', 'Byangabo', 'Nyakinama', 'Gakenke'];

type MarketCardProps = {
  name: string;
  onPress: () => void;
};

function MarketCard({ name, onPress }: MarketCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{name}</Text>
      <Text>Tap to see this week's price</Text>
    </Pressable>
  );
}

export default function MarketsScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgriSoko Pocket</Text>
      <Text style={styles.subtitle}>
        Built by Team Ibirayi for the Kinigi cooperative
      </Text>

      <FlatList
        data={MARKETS}
        keyExtractor={(m) => m}
        renderItem={({ item }) => (
          <MarketCard
            name={item}
            onPress={() => navigation.navigate('Market', { name: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { marginBottom: 16, color: '#666' },
  card: { padding: 16, margin: 8, borderRadius: 12, backgroundColor: '#E8F3EC' },
  name: { fontSize: 18, fontWeight: 'bold' },
});