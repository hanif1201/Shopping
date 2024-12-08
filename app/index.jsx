import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";

const onboarding = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href='/home' />;
  return (
    <SafeAreaView className='bg-white h-full'>
      <ScrollView className=' h-full'>
        <View className='h-full'>
          <Text className='text-xl font-psemibold text-center  '>Welcome </Text>
          <Text className='text-base font-pregular pt-2 text-center '>
            Please login or Sign-Up to continue
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/sign-up")}
            className='w-full mt-16 '
          >
            <Text className='text-base font-psemibold text-center text-white'>
              GET STARTED NOW
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default onboarding;
