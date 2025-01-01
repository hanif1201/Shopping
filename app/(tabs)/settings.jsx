import React, { useState, useEffect } from "react";

import { User } from "lucide-react-native";
import { StyleSheet, Text, View, TouchableOpacity, Switch } from "react-native";
import { signOut, getCurrentUser } from "../../lib/Appwrite";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { SafeAreaView } from "react-native-safe-area-context";

const settings = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [userName, setUserName] = useState("");

  const { setUser, setIsLogged } = useGlobalContext();
  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUserName(userData.username || "User");
        // setEmail(userData.email || "Email");
        // setPhone(userData.phone || "Phone");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User color='#0da357' size={24} />
          </View>
          <View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.planText}>Free Plan</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Subscription Plan</Text>
              <Text style={styles.settingSubtitle}>Free Plan</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Stock alerts</Text>
            </View>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: "#ddd", true: "#93c5fd" }}
              thumbColor={isNotificationsEnabled ? "#0da357" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>iCloud Sync</Text>
              <Text style={styles.settingSubtitle}>Premium feature</Text>
            </View>
            <TouchableOpacity style={styles.unlockButton}>
              <Text style={styles.unlockButtonText}>Unlock</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            className=' p-2 rounded-md'
            onPress={logout}
          >
            <Text className='text-white text-center'>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",

    paddingVertical: 16,
  },
  profileCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  planText: {
    fontSize: 14,
    color: "#666",
  },
  settingsCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  upgradeButton: {
    backgroundColor: "#0da357",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "500",
  },
  unlockButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unlockButtonText: {
    color: "#666",
    fontWeight: "500",
  },
});

export default settings;
