import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Menu } from "react-native-paper";
import { MoreVertical, Gift } from "lucide-react-native";
import {
  getLists,
  getProducts,
  updateList,
  deleteList,
} from "../../lib/Appwrite";

const Dashboard = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listProgress, setListProgress] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const fetchedLists = await getLists();
      setLists(fetchedLists);

      for (const list of fetchedLists) {
        const products = await getProducts(list.$id);
        const totalProducts = products.length;
        const boughtProducts = products.filter((p) => p.bought).length;

        setListProgress((prev) => ({
          ...prev,
          [list.$id]: {
            total: totalProducts,
            bought: boughtProducts,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      Alert.alert("Error", "Failed to fetch lists. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchLists();
  }, []);

  const ListItem = ({ list, progress, onPress }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [newName, setNewName] = useState(list.name);

    const handleRename = async () => {
      try {
        await updateList(list.$id, { name: newName });
        setMenuVisible(false);
        setIsRenameModalVisible(false);
        fetchLists(); // Refresh the lists
      } catch (error) {
        console.error("Error renaming list:", error);
        Alert.alert("Error", "Failed to rename list. Please try again.");
      }
    };

    const handleDelete = async () => {
      Alert.alert("Delete List", "Are you sure you want to delete this list?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteList(list.$id);
              setMenuVisible(false);
              fetchLists(); // Refresh the lists
            } catch (error) {
              console.error("Error deleting list:", error);
              Alert.alert("Error", "Failed to delete list. Please try again.");
            }
          },
        },
      ]);
    };

    return (
      <>
        <TouchableOpacity style={styles.listCard} onPress={onPress}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{list.name}</Text>
            <View style={styles.listHeaderRight}>
              <Text style={styles.progressText}>
                {progress?.bought || 0}/{progress?.total || 0}
              </Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <MoreVertical size={20} color='#666' />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(false);
                    setIsRenameModalVisible(true);
                  }}
                  title='Rename'
                />
                <Menu.Item onPress={handleDelete} title='Delete' />
              </Menu>
            </View>
          </View>
          {progress?.total > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(progress.bought / progress.total) * 100}%` },
                ]}
              />
            </View>
          )}
        </TouchableOpacity>

        <Modal
          visible={isRenameModalVisible}
          transparent
          animationType='fade'
          onRequestClose={() => setIsRenameModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename List</Text>
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder='Enter new name'
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setIsRenameModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleRename}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextPrimary,
                    ]}
                  >
                    Rename
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#0da357' />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Lists</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Gift size={24} color='#333' />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIcon, styles.headerIconCircle]}
          >
            <Text style={styles.headerIconText}>AR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MoreVertical size={24} color='#333' />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor='#0da357'
            colors={["#0da357"]}
            progressBackgroundColor='#ffffff'
          />
        }
      >
        <View style={styles.enjoyCard}>
          <View>
            <Text style={styles.enjoyTitle}>Enjoying EasyCart?</Text>
            <View style={styles.enjoyOptions}>
              <Text style={styles.notReallyText}>NOT REALLY</Text>
              <Text style={styles.yesText}>YES!</Text>
            </View>
          </View>
        </View>

        {lists.map((list) => (
          <ListItem
            key={list.$id}
            list={list}
            progress={listProgress[list.$id]}
            onPress={() =>
              router.push({
                pathname: "/pages/ListDetailsScreen",
                params: { listId: list.$id },
              })
            }
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/pages/AddListScreen")}
      >
        <Text style={styles.fabText}>+ NEW LIST</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  headerIconCircle: {
    backgroundColor: "#ff9800",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  enjoyCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  enjoyTitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
  },
  enjoyOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notReallyText: {
    color: "#666",
  },
  yesText: {
    color: "#4ade80",
    fontWeight: "500",
  },
  listCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  progressText: {
    color: "#666",
    marginRight: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e9ecef",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 2,
  },
  fab: {
    backgroundColor: "#0da357",
    margin: 16,
    padding: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  fabText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    padding: 8,
    minWidth: 80,
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: "#0da357",
    borderRadius: 6,
  },
  modalButtonText: {
    color: "#666",
  },
  modalButtonTextPrimary: {
    color: "#fff",
  },
});

export default Dashboard;
