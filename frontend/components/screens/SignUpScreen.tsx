import React, { useState } from "react";
import { API_URL } from '@env';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { AuthStackParamList } from "../navigator/AuthStack";
// import { RootStackParamList } from "../navigator/AppNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${API_URL}register`, {
        name,
        email,
        password,
      });
  
      if (response.data.success) {
        navigation.navigate("Login");
      } else {
        alert("Sign-up failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
  
      // Type guard for AxiosError
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with a status other than 2xx
          alert(
            `Error: ${error.response.data.message || error.response.statusText}`
          );
        } else if (error.request) {
          // Request was made but no response received
          alert("No response from server. Please check your network connection.");
        } else {
          // Something else caused the error
          alert(`Error: ${error.message}`);
        }
      } else {
        // Handle non-Axios errors
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg" }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
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
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { width: "80%", alignItems: "center" },
  title: { fontSize: 48, color: "#fff", marginBottom: 16 },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  signUpButton: {
    backgroundColor: "#6200EE",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  signUpButtonText: { fontSize: 18, color: "#fff" },
  loginLink: { fontSize: 16, color: "#fff", marginTop: 16 },
});

export default SignUpScreen;
