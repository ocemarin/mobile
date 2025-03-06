// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { useAuth, AuthProvider } from "../context/AuthContext";

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer independent={true}>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const AppNavigatorWrapper: React.FC = () => (
  <AuthProvider>
    <AppNavigator />
  </AuthProvider>
);

export default AppNavigatorWrapper;
