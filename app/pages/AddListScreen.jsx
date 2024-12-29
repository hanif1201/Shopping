import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { createList } from "../../lib/Appwrite";

const AddListScreen = ({ navigation }) => {
  const [listName, setListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateList = async () => {
    try {
      // Validate input
      if (!listName.trim()) {
        Alert.alert("Error", "Please enter a list name");
        return;
      }

      setIsLoading(true);

      // Create the main list
      const newList = await createList(
        listName.trim(),
        "Shopping list" // Simple description
      );

      Alert.alert("Success", "List created successfully", [
        {
          text: "Add Products",
          onPress: () =>
            navigation.navigate("AddProduct", { listId: newList.$id }),
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New List</Text>
      </View>

      <View style={styles.content}>
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
      </View>
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
  createButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
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
