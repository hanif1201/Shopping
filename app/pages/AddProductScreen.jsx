import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Plus, Minus, Check, Square, Loader } from "lucide-react-native";
import {
  addProduct,
  toggleProductBought,
  updateProductQuantity,
} from "../../lib/Appwrite";

const AddProductScreen = ({ route, navigation }) => {
  const router = useRouter();
  const { listId } = useLocalSearchParams();
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (increment) => {
    const newQuantity = Math.max(1, quantity + increment); // Prevent going below 1
    setQuantity(newQuantity);
  };

  const handleUpdateProductQuantity = async (
    productId,
    currentQuantity,
    increment
  ) => {
    try {
      const newQuantity = Math.max(1, currentQuantity + increment);
      await updateProductQuantity(productId, newQuantity);

      // Update local state
      setProducts(
        products.map((product) =>
          product.$id === productId
            ? { ...product, quantity: newQuantity }
            : product
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const handleToggleBought = async (productId, currentStatus) => {
    try {
      await toggleProductBought(productId, !currentStatus);

      // Update local state
      setProducts(
        products.map((product) =>
          product.$id === productId
            ? { ...product, bought: !currentStatus }
            : product
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleAddProduct = async () => {
    try {
      if (!productName.trim()) {
        Alert.alert("Error", "Please enter a product name");
        return;
      }

      setIsLoading(true);

      const newProduct = await addProduct(listId, productName.trim(), quantity);

      // Add to local state with Appwrite document ID
      setProducts([
        ...products,
        {
          ...newProduct,
          name: productName.trim(),
          quantity: quantity,
          bought: false,
        },
      ]);

      // Clear inputs for next product
      setProductName("");
      setQuantity(1);

      Alert.alert("Success", "Product added successfully");
    } catch (error) {
      console.error("Add product error:", error);
      Alert.alert("Error", error.message || "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push({
      pathname: "/pages/ListDetailsScreen",
      params: { listId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Products</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Recently added products */}
        {products.length > 0 && (
          <View style={styles.recentProducts}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            {products.map((product) => (
              <View key={product.$id} style={styles.recentProductItem}>
                <TouchableOpacity
                  onPress={() =>
                    handleToggleBought(product.$id, product.bought)
                  }
                  style={styles.checkbox}
                >
                  {product.bought ? (
                    <Check size={20} color='#0da357' />
                  ) : (
                    <Square size={20} color='#0da357' />
                  )}
                </TouchableOpacity>

                <Text
                  style={[
                    styles.productName,
                    product.bought && styles.productNameBought,
                  ]}
                >
                  {product.name}
                </Text>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdateProductQuantity(
                        product.$id,
                        product.quantity,
                        -1
                      )
                    }
                    style={styles.quantityButton}
                  >
                    <Minus size={16} color='#0da357' />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{product.quantity}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      handleUpdateProductQuantity(
                        product.$id,
                        product.quantity,
                        1
                      )
                    }
                    style={styles.quantityButton}
                  >
                    <Plus size={16} color='#0da357' />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add new product form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>New Product</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder='Enter product name'
              placeholderTextColor='#666'
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.quantityInputContainer}>
              <TouchableOpacity
                onPress={() => handleQuantityChange(-1)}
                style={styles.quantityButton}
              >
                <Minus size={16} color='#0da357' />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                onPress={() => handleQuantityChange(1)}
                style={styles.quantityButton}
              >
                <Plus size={16} color='#0da357' />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.buttonDisabled]}
            onPress={handleAddProduct}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader size={24} color='#FFF' />
            ) : (
              <>
                <Plus color='#FFF' size={24} />
                <Text style={styles.buttonText}>Add Product</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.buttonText}>Finish</Text>
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
    borderBottomColor: "#e5e7eb",
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
  recentProducts: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  recentProductItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  checkbox: {
    marginRight: 12,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  productNameBought: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  form: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quantityButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#0da357",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  finishButton: {
    backgroundColor: "#0da357",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default AddProductScreen;
