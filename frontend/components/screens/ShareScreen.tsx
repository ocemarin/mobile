import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Button,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { Link, NavigationProp, useNavigation } from "@react-navigation/native";
import PostScreen from "./ImageScreen";
import HomeScreen from "./HomeScreen";
import { AppStackParamList } from "../navigator/AppStack";

interface ShareProps {}

const Share: React.FC<ShareProps> = () => {
  const [desc, setDesc] = useState<string>("");
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileRef = useRef<any>();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("desc", desc);

      if (file) {
        formData.append("post", file);
        await axios.post(
          process.env.API_URL + "/api/v1/post/new",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        // Handle response accordingly
      }

      if (selectedFile) {
        formData.append("audio", selectedFile);
        await axios.post(
          process.env.API_URL + "/api/v1/audio/new",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        // Handle response accordingly
      }

      if (desc && !file && !selectedFile) {
        await axios.post(process.env.API_URL + "/post/new", formData, {
          withCredentials: true,
        });
      }

      setDesc("");
      fileRef.current.value = "";
      setFile(null);
      setSelectedFile(null);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      // Handle error
    }
  };

  return (
    <View style={styles.share}>
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.left}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              onChangeText={(text) => setDesc(text)}
              value={desc}
            />
          </View>
          <View style={styles.right}>
            {file && (
              <Image
                source={{ uri: URL.createObjectURL(file) }}
                style={styles.file}
              />
            )}
            {selectedFile && (
              <View style={styles.audioContainer}>
                <audio controls>
                  <source
                    src={URL.createObjectURL(selectedFile)}
                    type="audio/mpeg"
                  />
                </audio>
              </View>
            )}
          </View>
        </View>
        <View style={styles.hr} />
        <View style={styles.bottom}>
          <View style={styles.left}>
            <TouchableOpacity
              disabled={isLoading}
              onPress={() => fileRef.current.click()}
            >
              <View style={styles.item}>
                <Image style={styles.icon} />
                <Text>Add Image</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.item}>
              <Image style={styles.icon} />
              <Text>Add Place</Text>
            </View>
            <View style={styles.item}>
              <Image style={styles.icon} />
              <Text>Tag Friends</Text>
            </View>
            <View style={styles.item}>
              <TouchableOpacity onPress={() => fileRef.current.click()}>
                <View style={styles.item}>
                  {/* <KeyboardVoiceIcon /> */}
                  <Text>Add audio</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.right}>
            <Button title="Share" onPress={handleShare} disabled={isLoading} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  share: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 10,
  },
  container: {
    padding: 10,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 10,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  file: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginLeft: 10,
  },
  audioContainer: {
    marginLeft: 10,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
});

export default Share;
