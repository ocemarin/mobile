// navigation/AppStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PostScreen from "../screens/ImageScreen";

export type AppStackParamList = {
  Home: undefined;
  Post: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* <Stack.Screen name="Post" component={PostScreen} /> */}
    </Stack.Navigator>
  );
};

export default AppStack;
