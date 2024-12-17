import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ShoppingCart, AlertTriangle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dashboard = () => {
  const lists = [
    {
      id: 1,
      name: "Weekly Groceries",
      lastUpdated: "2024-12-15",
      statistics: {
        outOfStock: 2,
        lowStock: 1,
      },
    },
    {
      id: 2,
      name: "Household Items",
      lastUpdated: "2024-12-14",
      statistics: {
        outOfStock: 1,
        lowStock: 2,
      },
    },
  ];
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>Manage your shopping lists</Text>
        </View>

        <ScrollView style={styles.listContainer}>
          {lists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={styles.listCard}
              onPress={() => navigation.navigate("ListDetails", { list })}
            >
              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.listTitle}>{list.name}</Text>
                  <Text style={styles.listDate}>
                    Last updated:{" "}
                    {new Date(list.lastUpdated).toLocaleDateString()}
                  </Text>
                </View>
                <ShoppingCart color='#2563eb' size={24} />
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBadgeRed}>
                  <Text style={styles.statText}>
                    {list.statistics.outOfStock} out of stock
                  </Text>
                </View>
                <View style={styles.statBadgeYellow}>
                  <Text style={styles.statText}>
                    {list.statistics.lowStock} low stock
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddList")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
  },
  welcomeCard: {
    backgroundColor: "white",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  listCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  listDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  statBadgeRed: {
    backgroundColor: "#fee2e2",
    padding: 6,
    borderRadius: 12,
  },
  statBadgeYellow: {
    backgroundColor: "#fef3c7",
    padding: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: "#333",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: {
    fontSize: 24,
    color: "white",
  },
});
