import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
} from "react-native";
import { AppStackParamList } from "../navigator/AppStack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import PostScreen from "./ImageScreen";
import Icon from "react-native-vector-icons/Ionicons";
import { api } from "@/app/authentication/authenticationCall";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  GestureHandlerRootView,
  TouchableHighlight,
} from "react-native-gesture-handler";
import { Audio } from "expo-av";
import { AntDesign } from "@expo/vector-icons";

const HomeScreen: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);

  const [desc, setDesc] = useState<string>("");
  const [file, setFile] = useState<any>(null);
  const fileRef = useRef<any>();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [sound, setSound] = useState<any>(null);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleAudioPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setSelectedFile(result?.assets[0]);
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);

      if (desc.length < 1) {
        setIsLoading(false);
        return "Description cannot be empty";
      }

      const formData = new FormData();
      formData.append("desc", desc);

      if (file) {
        formData.append("post", {
          uri: file.uri,
          name: file.fileName,
          type: file.mimeType,
        } as any);
      }

      if (selectedFile) {
        formData.append("audio", {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType,
        } as any);
      }

      try {
        if (!selectedFile) {
          await api.post("/post/new", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });
        }
        if (selectedFile) {
          await api.post("/audio/new", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });
        }

        const { data } = await api.get(`/posts`, {
          withCredentials: true,
        });
        setPosts(data.posts);

        // Reset state
        setDesc("");
        setFile(null);
        setSelectedFile(null);
      } catch (error) {
        console.log("error here", error);
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const playAudio = async () => {
    if (selectedFile && selectedFile.uri) {
      const soundData = new Audio.Sound();
      try {
        await soundData.loadAsync({ uri: selectedFile.uri });
        await soundData.playAsync();
        setSound(soundData);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get(`/posts`, {
          withCredentials: true,
        });
        setPosts(data.posts);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleViewFooter = () => {
    setShowFooter(true);
  };

  const handleToggleShare = () => {
    setShowShare(!showShare);
  };
  const [showHeader, setShowHeader] = useState(false);

  const handleTapButton = () => {
    setShowHeader(!showHeader);
  };

  return (
    <GestureHandlerRootView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View style={styles.container}>
        {/* Static Header */}
        {showHeader && (
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
            <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoButtonText}>Photo</Text>
            </TouchableOpacity>
          </View>
        )}
        {!showHeader && (
          <TouchableOpacity
            onPress={handleTapButton}
            style={styles.headerButtonText}
          >
            <Text style={styles.buttonText}>Tap</Text>
          </TouchableOpacity>
        )}

        {/* Static Stories Section */}
        <View style={styles.stories}>

        </View>

        {/* Share section */}
        <View style={styles.container3}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleToggleShare}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {showShare && (
          <View style={styles.share}>
            <View style={styles.container2}>
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
                    <Image source={{ uri: file.uri }} style={styles.file} />
                  )}
                  {selectedFile && (
                    <TouchableOpacity onPress={sound ? stopAudio : playAudio}>
                      <AntDesign
                        name={sound ? "pausecircle" : "playcircleo"}
                        size={40}
                        color="black"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.hr} />
              <View style={styles.bottom}>
                <View style={styles.left}>
                  <TouchableOpacity
                    disabled={isLoading}
                    onPress={handleImagePick}
                  >
                    <View style={styles.item}>
                      <Icon name="add-outline" size={20} color="#000" />
                      <Icon name="image-outline" size={20} color="#000" />
                      {/* <Icon name="image-outline" size={30} color="#000" /> */}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.item}>
                    <Icon name="add-outline" size={20} color="#000" />
                    <Icon name="location-outline" size={20} color="#000" />
                  </View>
                  <View style={styles.item}>
                    <TouchableOpacity onPress={handleAudioPick}>
                      <View style={styles.item}>
                        <Icon name="add-outline" size={20} color="#000" />
                        <Icon
                          name="musical-notes-outline"
                          size={20}
                          color="#000"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.right}>
                  <Button
                    title="Share"
                    onPress={handleShare}
                    disabled={isLoading}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* View Button */}

        <View style={{ flex: 1 }}>
  {isLoading ? (
    <View style={styles.loadingContainer}> 
      <Text>Loading...</Text>
    </View>
  ) : (
    <FlatList
      data={posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} // Sorting posts by createdAt in descending order
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <PostScreen post={item} />}
    />
  )}
</View>



        {!showFooter && (
          <TouchableOpacity onPress={handleViewFooter} style={styles.button}>
            <View style={styles.buttonContent}>
              <Text style={styles.showButtonText}>Tap</Text>
              <View style={styles.likesBadge}>
                <Text style={styles.likesText}>35</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        {/* Static Footer */}
        {showFooter && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem}>
              <Icon name="home-outline" size={25} color="#000" />
              <View style={styles.footerBadge}>
                <Text style={styles.footerBadgeText}>15+</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem}>
              <Icon name="search-outline" size={25} color="#000" />
              <View style={styles.footerBadge}>
                <Text style={styles.footerBadgeText}>1</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem}>
              <Icon name="chatbubble-ellipses-outline" size={25} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem}>
              <Icon name="heart-outline" size={25} color="#000" />
              <View style={styles.footerBadge}>
                <Text style={styles.footerBadgeText}>15+</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem}>
              <Icon name="person-outline" size={25} color="#000" />
              <View style={styles.footerBadge}>
                <Text style={styles.footerBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f0f0f0" },
  header: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logo: {
    width: 50, // Adjust width as needed
    height: 50, // Adjust height as needed
    resizeMode: "contain",
  },

  headerButtonText: {
    backgroundColor: "#8a2bc3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    width: "25%",
    alignSelf: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container3: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#8a2bc3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    width: "25%",
    alignSelf: "center",
  },
  headerText: { fontSize: 20, fontWeight: "bold" },
  photoButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  stories: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: 350
  },
  storyBox: {
    width: "22%",
    height: 100,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    padding: 5,
    position: "relative",
    marginHorizontal: 5,
  },
  storyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  storyText: {
    fontSize: 12,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#8a2bc3",
    padding: 10,
    borderRadius: 5,
    position: "absolute",
    bottom: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "25%",
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  showButtonText: {
    color: "#fff",
  },
  likesBadge: {
    borderColor: "red",
    backgroundColor: 'red',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
  },
  likesText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  footer: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  footerItem: {
    alignItems: "center",
  },
  footerBadge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "#FF0000",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  footerBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  container2: {
    padding: 10,
  },

  share: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 10,
  },
  // container: {
  //   padding: 10,
  // },
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
    justifyContent: "space-between",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  item: {
    flexDirection: "row",
    // alignItems: "center",
    marginRight: 8,
  },
});

export default HomeScreen;
