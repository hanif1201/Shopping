import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  Circle,
  ChevronLeft,
  MoreVertical,
  Plus,
  Minus,
  CheckCircle2,
  Trash,
  Package,
} from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getProducts,
  deleteProduct,
  toggleProductBought,
  updateProduct,
  getList,
} from "../../lib/Appwrite";

const ListDetailsScreen = () => {
  const { listId } = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [listName, setListName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("unit");
  const [quantity, setQuantity] = useState(1);
  const [editedName, setEditedName] = useState("");
  const isFocused = useIsFocused();
  const router = useRouter();

  useEffect(() => {
    if (isFocused && listId) {
      fetchListDetails();
      fetchProducts();
    }
  }, [isFocused, listId]);

  const fetchListDetails = async () => {
    if (!listId) return;
    try {
      const listDetails = await getList(listId);
      setListName(listDetails.name);
    } catch (error) {
      console.error("Error fetching list details:", error);
    }
  };

  const fetchProducts = async () => {
    if (!listId) return;
    try {
      setIsLoading(true);
      const fetchedProducts = await getProducts(listId);
      setProducts(fetchedProducts);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBought = async (e, productId, currentStatus) => {
    e.stopPropagation();
    try {
      await toggleProductBought(productId, !currentStatus);
      // Update the local state with the new bought status
      const updatedProducts = products.map((product) =>
        product.$id === productId
          ? { ...product, bought: !currentStatus }
          : product
      );
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error toggling bought status:", error);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleUpdateQuantity = (increment) => {
    setQuantity(Math.max(1, quantity + increment));
  };

  const handleSave = async () => {
    if (!editingProduct || !editedName.trim()) {
      Alert.alert("Error", "Product name cannot be empty");
      return;
    }

    try {
      const updatedProduct = {
        name: editedName.trim(),
        quantity: quantity,
        unit: selectedUnit,
      };

      await updateProduct(editingProduct.$id, updatedProduct);

      // Update the local state with the new product details
      const updatedProducts = products.map((product) =>
        product.$id === editingProduct.$id
          ? {
              ...product,
              ...updatedProduct,
            }
          : product
      );
      setProducts(updatedProducts);

      // Reset the modal state
      setShowUnitModal(false);
      setEditingProduct(null);
      setEditedName("");
      setQuantity(1);
      setSelectedUnit("unit");
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Error", "Failed to update product");
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;

    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(editingProduct.$id);
              setProducts(products.filter((p) => p.$id !== editingProduct.$id));
              setShowUnitModal(false);
              setEditingProduct(null);
            } catch (error) {
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{listName}</Text>
        <TouchableOpacity>
          <MoreVertical size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color='#9ca3af' />
            <Text style={styles.emptyStateTitle}>No items yet</Text>
            <Text style={styles.emptyStateText}>
              Add your first item to get started
            </Text>
          </View>
        ) : (
          products.map((product) => (
            <TouchableOpacity
              key={product.$id}
              style={styles.itemContainer}
              onPress={() => {
                setEditingProduct(product);
                setEditedName(product.name);
                setShowUnitModal(true);
                setQuantity(product.quantity || 1);
                setSelectedUnit(product.unit || "unit");
              }}
            >
              <TouchableOpacity
                style={styles.checkbox}
                onPress={(e) =>
                  handleToggleBought(e, product.$id, product.bought)
                }
              >
                {product.bought ? (
                  <CheckCircle2 size={24} color='#4CAF50' />
                ) : (
                  <Circle size={24} color='#666' />
                )}
              </TouchableOpacity>
              <Text
                style={[styles.itemName, product.bought && styles.itemBought]}
              >
                {product.name}
              </Text>
              {product.quantity > 1 && (
                <Text style={styles.quantityText}>
                  {product.quantity} {product.unit || ""}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: "/pages/AddProductScreen",
            params: { listId },
          })
        }
      >
        <Plus color='white' size={24} />
      </TouchableOpacity>

      <Modal
        visible={showUnitModal}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowUnitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TextInput
                style={styles.modalTitle}
                value={editedName}
                onChangeText={setEditedName}
                placeholder='Product name'
              />
            </View>

            <View style={styles.modalBody}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(-1)}
                  >
                    <Minus size={20} color='#2563eb' />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(1)}
                  >
                    <Plus size={20} color='#2563eb' />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Unit</Text>
                <View style={styles.unitSelector}>
                  {["l", "kg", "ml", "g"].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        selectedUnit === unit && styles.unitButtonSelected,
                      ]}
                      onPress={() => setSelectedUnit(unit)}
                    >
                      <Text
                        style={[
                          styles.unitButtonText,
                          selectedUnit === unit &&
                            styles.unitButtonTextSelected,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.deleteButton]}
                onPress={handleDeleteProduct}
              >
                <Trash size={20} color='#ef4444' />
              </TouchableOpacity>
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={[styles.footerButton, styles.cancelButton]}
                  onPress={() => setShowUnitModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  checkbox: {
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
  },
  itemBought: {
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },
  quantityText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
  },
  modalBody: {
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  unitSelector: {
    flexDirection: "row",
    gap: 8,
  },
  unitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  unitButtonSelected: {
    backgroundColor: "#2563eb",
  },
  unitButtonText: {
    fontSize: 16,
    color: "#1f2937",
  },
  unitButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    minWidth: 100,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    minWidth: 100,
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default ListDetailsScreen;
