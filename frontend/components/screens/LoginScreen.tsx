// screens/LoginScreen.tsx
import React, { useState } from "react";
import { API_URL } from '@env';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AuthStackParamList } from "../navigator/AuthStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Cookies from "js-cookie";
import { tokenStorage } from "../../app/authentication/authenticationCall";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Helper function to determine if input is email or phone
  const isEmail = (input: string): boolean => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  const handleLogin = async () => {
    try {
      console.log('API_URL ', API_URL);
      
      // Determine if input is email or phone and create appropriate payload
      const payload = {
        password,
        ...(isEmail(emailOrPhone) 
          ? { email: emailOrPhone } 
          : { phone: emailOrPhone })
      };
      
      const response = await axios.post(
        `${API_URL}login`,
        payload,
        { withCredentials: true }
      );
      
      console.log('response ', response);
      if (response.data.success) {
          const token = response.data.token;
          if (token) {
            // Set the token using platform-specific storage
            console.log('token ', token);
            const stored = await tokenStorage.setToken("token", token);
            if (stored) {
              login();
            } else {
              alert("Failed to store authentication token");
            }
          } else {
            alert("No token found in response");
          }
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error(error); // Log the full error for debugging
  
      // Type guard for AxiosError
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with a status other than 2xx
          alert(`Error: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
          // Request was made but no response received
          alert("No response from server. Please try again.");
        } else {
          // Something else caused the error
          alert(`Error: ${error.message}`);
        }
      } else {
        // Non-Axios errors
        alert("An unexpected error occurred.");
      }
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg",
      }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Zahface.</Text>
        <Text style={styles.subtitle}>
          Connect with families, friends and the world around you on Zahface.
        </Text>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.signUpButtonText}>Sign Up....</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Email or Phone number"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { width: "80%", alignItems: "center" },
  title: { fontSize: 48, color: "#fff", marginBottom: 16 },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  signUpButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  signUpButtonText: { fontSize: 18, color: "#000" },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  loginButton: {
    backgroundColor: "#6200EE",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  loginButtonText: { fontSize: 18, color: "#fff" },
});

export default LoginScreen;
