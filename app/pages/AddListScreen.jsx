import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { createList } from "../../lib/Appwrite";
import { router } from "expo-router";

// Common shopping list suggestions with categories
const LIST_SUGGESTIONS = {
  "Recently Used": ["Groceries", "Home Items", "Personal Care"],
  Popular: ["Electronics", "Clothes", "Books"],
  Special: ["Party Supplies", "Holiday Shopping", "Gifts"],
  Essentials: ["Office Supplies", "Emergency Items", "Pet Supplies"],
};

const AddListScreen = ({ navigation }) => {
  const [listName, setListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectSuggestion = (suggestion) => {
    setListName(suggestion);
  };

  const handleCreateList = async () => {
    try {
      if (!listName.trim()) {
        Alert.alert("Error", "Please enter a list name");
        return;
      }

      setIsLoading(true);
      const newList = await createList(listName.trim(), "Shopping list");

      Alert.alert("Success", "List created successfully", [
        {
          text: "Add Products",
          onPress: () =>
            router.push({
              pathname: "/pages/AddProductScreen",
              params: { listId: newList.$id },
            }),
        },
        {
          text: "Go Back",
          onPress: () => navigation.goBack(),
          style: "cancel",
        },
      ]);
    } catch (error) {
      console.error("Create list error:", error);
      Alert.alert("Error", error.message || "Failed to create list");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestionCategory = (category, suggestions) => (
    <View style={styles.categoryContainer} key={category}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            style={[
              styles.chip,
              listName === suggestion && styles.selectedChip,
            ]}
            onPress={() => handleSelectSuggestion(suggestion)}
          >
            <Text
              style={[
                styles.chipText,
                listName === suggestion && styles.selectedChipText,
              ]}
            >
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New List</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>List Name</Text>
          <TextInput
            style={styles.input}
            value={listName}
            onChangeText={setListName}
            placeholder='Enter list name'
            placeholderTextColor='#666'
          />
        </View>

        <Text style={styles.suggestionsTitle}>Suggested Lists</Text>

        {Object.entries(LIST_SUGGESTIONS).map(([category, suggestions]) =>
          renderSuggestionCategory(category, suggestions)
        )}

        <TouchableOpacity
          style={[
            styles.createButton,
            isLoading && styles.createButtonDisabled,
          ]}
          onPress={handleCreateList}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? "Creating..." : "Create List"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 12,
  },
  chipsContainer: {
    paddingRight: 16,
  },
  chip: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  selectedChip: {
    backgroundColor: "#0da357",
    borderColor: "#0da357",
  },
  chipText: {
    fontSize: 14,
    color: "#4b5563",
  },
  selectedChipText: {
    color: "white",
  },
  createButton: {
    backgroundColor: "#0da357",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  createButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddListScreen;
