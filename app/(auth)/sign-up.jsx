import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../components/FormField";

import React, { useState } from "react";
// import { images } from "../../constants";
import { registerUser } from "../../lib/Appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);
    try {
      const result = await registerUser(
        form.email,
        form.password,
        form.username
      );
      setUser(result);
      setIsLogged(true);

      router.replace("/dashboard");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView className='bg-white h-full '>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps='handled'
      >
        <View
          className='w-full flex justify-center h-full px-4 '
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Text className='text-base font-psemibold text-center  '>
            Get Started
          </Text>
          <Text className='text-base font-base text-black  text-center font-pregular'>
            Create a free account and explore efficient tractor to rent.
          </Text>
          <FormField
            title='Username'
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles=''
          />
          <FormField
            title='Email'
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles='mt-7'
            keyboardType='email-address'
          />

          <FormField
            title='Password'
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles='mt-7'
          />

          <TouchableOpacity
            className='mt-7 bg-[#0da357] p-4 rounded-lg'
            onPress={submit}
            disabled={isSubmitting}
          >
            <Text className='text-white text-center text-lg font-psemibold'>
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className='flex justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-black font-pregular'>
              Have an account already?
            </Text>
            <Link
              href='/sign-in'
              className='text-lg font-psemibold color-[#0da357]'
            >
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: Dimensions.get("window").height,
  },
});

export default SignUp;
