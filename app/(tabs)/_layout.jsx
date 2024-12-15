import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider"; // Import the context
import icons from "../../constants/icons";

const TabIcon = ({ icon, color, name, focused, avatar }) => {
  return (
    <View className='flex items-center justify-center gap-2'>
      {avatar ? (
        <Image
          source={{ uri: avatar }} // Use the avatar URL
          resizeMode='contain'
          className='w-6 h-6 rounded-full' // Make it circular
        />
      ) : (
        <Image
          source={icon}
          resizeMode='contain'
          tintColor={color}
          className='w-6 h-6'
        />
      )}
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  const { user } = useGlobalContext(); // Access user from context

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#336431",
          tabBarInactiveTintColor: "#000",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#ffff",
            borderTopWidth: 1,
            height: 60,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            shadowColor: "#000",
            shadowOffset: { width: 2, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          },
        }}
      >
        <Tabs.Screen
          name='dashboard'
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home05}
                color={color}
                name='Dashboard'
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <StatusBar backgroundColor='#218225' style='light' />
    </>
  );
};

export default TabLayout;
