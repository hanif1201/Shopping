import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart2, Filter, Trash, Search } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
const ListDetailsScreen = ({ route, navigation }) => {
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { list } = useLocalSearchParams();
  console.log(list);
  const sections = [
    {
      id: 1,
      name: "Pantry",
      items: [
        { id: 1, name: "Rice", quantity: 2, status: "green", price: 5.99 },
        { id: 2, name: "Pasta", quantity: 1, status: "red", price: 2.99 },
      ],
    },
    {
      id: 2,
      name: "Dairy",
      items: [
        { id: 3, name: "Milk", quantity: 1, status: "yellow", price: 3.99 },
      ],
    },
  ];

  // Filter items based on search query
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const getStatusColor = (status) => {
    switch (status) {
      case "green":
        return "#dcfce7";
      case "yellow":
        return "#fef3c7";
      case "red":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color='#666' size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder='Search items...'
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor='#666'
            />
          </View>
        </View>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowStats(!showStats)}
          >
            <BarChart2 color='#333' size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Filter color='#333' size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {showStats && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Items</Text>
                  <Text style={styles.statValue}>15</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Out of Stock</Text>
                  <Text style={styles.statValue}>3</Text>
                </View>
              </View>
            </View>
          )}

          {/* No Results Message */}
          {filteredSections.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No items found</Text>
            </View>
          )}

          {sections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              {section.items.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      Quantity: {item.quantity} | ${item.price}
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                    <TouchableOpacity>
                      <Trash color='#666' size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddItem")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    gap: 8,
  },
  headerButton: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
  content: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#2563eb",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  sectionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemDetails: {
    fontSize: 14,
    color: "#666",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
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
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0, // Remove default padding on Android
  },
  noResults: {
    padding: 24,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ListDetailsScreen;
