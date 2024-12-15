import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { signOut } from "../../lib/Appwrite";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import React from "react";

const dashboard = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
  };
  return (
    <View className='flex-1 items-center justify-center'>
      <Text>dashboard</Text>
      <TouchableOpacity className='bg-red-500 p-2 rounded-md' onPress={logout}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default dashboard;

const styles = StyleSheet.create({});
