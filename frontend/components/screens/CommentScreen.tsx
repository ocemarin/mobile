import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import moment from "moment";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { api } from "@/app/authentication/authenticationCall";
import * as DocumentPicker from "expo-document-picker";
import { AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";

interface Comment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profilePic?: {
      url: string;
    };
  };
  desc: string;
  audioId?: {
    audio: {
      url: string;
    };
  };
  createdAt: string;
}

interface CommentsProps {
  postId: string;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [desc, setDesc] = useState("");
  const [selectedAudio, setSelectedAudio] = useState<any>(null); // State for selected audio
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<any>(null);

  useEffect(() => {
    const getComments = async () => {
      try {
        const { data } = await api.get(`/post/${postId}/comment`, {
          withCredentials: true,
        });

        setComments(data.comments);
      } catch (err) {
        console.error(err);
      }
    };

    getComments();
  }, []);
  const handleAudioPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setSelectedAudio(result?.assets[0]);
    }
  };
  const addComment = async () => {
    if (!desc.trim() && !selectedAudio?.name) {
      console.error("Please add comment");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("desc", desc);
      try {
        if (selectedAudio) {
          console.log('selected audio ', selectedAudio);
          
          formData.append("audio", {
            uri: selectedAudio.uri,
            name: selectedAudio.name,
            type: selectedAudio.mimeType,
          } as any);
          const { data } = await api.post("/audio/new", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          console.log('data ', data);
          
          const allComments = await api.post(
            `/post/${postId}/comment`,
            { desc: selectedAudio?.name, audio: data.audio._id },
            {
              withCredentials: true,
            }
          );
          setComments(allComments.data.comments);
        } else {
          const { data } = await api.post(
            `/post/${postId}/comment`,
            { desc },
            {
              withCredentials: true,
            }
          );
          setComments(data.comments);
        }
      } catch (error) {
        console.log("error here", error);
      }
      setDesc("");
      setSelectedAudio(null);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const playAudio = async (audio: { url: string } | undefined) => {
    if (audio && audio.url) {
      const soundData = new Audio.Sound();
      try {
        await soundData.loadAsync({ uri: audio.url });
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
  return (
    <View style={styles.container}>
      <View style={styles.write}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment"
            value={
              selectedAudio?.name
                ? `${selectedAudio?.name}.${
                    selectedAudio.mimeType.split("/")[1]
                  }`
                : desc
            }
            onChangeText={(text) => setDesc(text)}
          />
        </View>
        <TouchableOpacity onPress={handleAudioPick}>
          <View style={styles.audioButton}>
            <Icon name="keyboard-voice" size={20} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addComment}
          disabled={isLoading}
        >
          <Text style={styles.addButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      {comments.map((comment) => (
        <View style={styles.commentContainer} key={comment._id}>
          <View>
            <Text style={{ marginBottom: 5, fontWeight: "bold" }}>
              {comment.userId.name}
            </Text>
            <Text style={{ marginBottom: 5 }}>{comment.desc}</Text>
            {comment.audioId && (
              <View style={styles.audioContainer}>
                <TouchableOpacity
                  onPress={() =>
                    sound ? stopAudio() : playAudio(comment.audioId?.audio)
                  }
                >
                  <AntDesign
                    name={sound ? "pausecircle" : "playcircleo"}
                    size={40}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text style={styles.date}>{moment(comment.createdAt).fromNow()}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  write: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
  },
  audioButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginRight: 5,
    marginLeft: 5,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  commentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  date: {
    color: "#888",
  },
  audioContainer: {
    marginLeft: 10,
  },
});

export default Comments;
