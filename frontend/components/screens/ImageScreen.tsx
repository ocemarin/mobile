import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import moment from "moment";
import axios from "axios";
import { AppStackParamList } from "../navigator/AppStack"; // Adjust this import as necessary
import Comments from "./CommentScreen";
import { api } from "@/app/authentication/authenticationCall";
import { AVPlaybackSource, Audio } from "expo-av";
import { AntDesign } from "@expo/vector-icons";

interface PostProps {
  post: any;
}

const PostScreen: React.FC<PostProps> = ({ post }) => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [likes, setLikes] = useState<number>(0);
  const [commentOpen, setCommentOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(true);
  const [postId, setPostId] = useState("");
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const { data } = await api.get(`/post/${post._id}/like`, {
          withCredentials: true,
        });

        const likesCount = data.likes.length;
        const likedByUser = data.likes.some(
          (like: any) => like.userId === post.userId
        );
        setLikes(likesCount);
        setLiked(likedByUser);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLikes();
  }, []);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (liked) {
        await api.delete(`/post/${post._id}/like`, { withCredentials: true });
        setLikes(likes - 1);
      } else {
        await api.post(`/post/${post._id}/like`, {}, { withCredentials: true });
        setLikes(likes + 1);
      }
      setLiked(!liked);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setLiked(true);
        alert('Post already liked')
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowButtons = () => {
    setShowButtons(false);
  };

  const commentSection = (id: any) => {
    setPostId(post._id);

    setCommentOpen(true);
  };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [position, setPosition] = useState<number>(0);

  const playAudio = async () => {
    if (post.audio) {
      const { sound } = await Audio.Sound.createAsync({ uri: post.audio.url });
      setSound(sound);
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.post}>
      <View style={styles.user}>
        <Image
          source={{ uri: post.userId.profilePic?.url }}
          style={styles.avatar}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{post.userId.name}</Text>
          <Text style={styles.date}>{moment(post.createdAt).fromNow()}</Text>
        </View>
      </View>
      <Text style={styles.content}>{post.desc}</Text>
      {post.images && (
        <Image source={{ uri: post.images.url }} style={styles.image} />
      )}
      {post.audio && (
        <View style={styles.audioContainer}>
          <TouchableOpacity onPress={isPlaying ? pauseAudio : playAudio}>
            <AntDesign
              name={isPlaying ? "pausecircle" : "playcircleo"}
              size={40}
              color="black"
            />
          </TouchableOpacity>

          <Text style={styles.duration}>
            {position > 0 && duration
              ? `${Math.floor(position / 1000)} / ${Math.floor(
                  duration / 1000
                )}s`
              : ""}
          </Text>
        </View>
      )}
      {showButtons && (
        <TouchableOpacity onPress={handleShowButtons} style={styles.showButton}>
          <View style={styles.buttonContent}>
            <Text style={styles.showButtonText}>View</Text>
            <View style={styles.likesBadge}>
              <Text style={styles.likesText}>{likes}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {!showButtons && (
        <View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleLike} disabled={isLoading}>
              <Text style={liked ? styles.liked : styles.like}>
                Like ({likes})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={(id) => commentSection(id)}>
              <Text>Comments</Text>
            </TouchableOpacity>
          </View>
          {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
          {commentOpen && <Comments postId={postId} />}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  post: { padding: 10, margin: 10, backgroundColor: "#fff", borderRadius: 10 },
  user: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  details: { marginLeft: 10 },
  name: { fontWeight: "bold" },
  date: { color: "#555" },
  audioContainer: { marginTop: 10 },
  progressContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  progressBar: { height: "100%", backgroundColor: "black", borderRadius: 5 },
  duration: { marginLeft: 10 },
  content: { marginTop: 10 },
  image: { width: "100%", height: 200, marginTop: 10 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  like: { color: "#555" },
  liked: { color: "red" },
  likesBadge: {
    borderColor: "red",
    backgroundColor: "red",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  likesText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  showButton: {
    backgroundColor: "#8a2bc3",
    alignSelf: "center",
    marginTop: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  showButtonText: {
    color: "#fff",
  },
});

export default PostScreen;
