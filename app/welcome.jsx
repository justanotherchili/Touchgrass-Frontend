import React, { useState, useRef } from "react";
import {
  TextInput,
  Text,
  View,
  Alert,
  Pressable,
  Image,
  Animated,
  SafeAreaView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import styles from "../styling/styles";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "../firebaseConfig";
import PulsingLogo from "../components/PulsingLogo";

const WelcomeScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const signInFunc = async () => {
    if (!email || !password) {
      Alert.alert(
        "Sign in failed",
        "Please enter a valid username and password",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      return;
    }
    setIsLoading(true);
    try {
      const user = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      if (user) router.navigate("/signedin/map");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error.message);
      setEmail("");
      setPassword("");
      Alert.alert(
        "Sign in failed",
        "Please enter a valid username and password",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      // Handle error
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <PulsingLogo creatingUser={isLoading} />

      <Text style={styles.title}>Touch Grass</Text>

      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          value={email}
          placeholder={"Enter Email"}
          placeholderTextColor={"#000"}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          value={password}
          placeholder={"Enter Password"}
          placeholderTextColor={"#000"}
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          { backgroundColor: pressed ? "yellow" : "lightgreen" },
          styles.button,
        ]}
        onPress={signInFunc}
      >
        <Text style={styles.text}>Log in</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          { backgroundColor: pressed ? "yellow" : "lightgreen" },
          styles.button,
        ]}
      >
        <Link href="/signup">
          <Text style={styles.text}>Sign up </Text>
        </Link>
      </Pressable>
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#4FD3DA',
//     alignItems: 'center',
//     justifyContent: 'center',
//     },
//     title:{
//       fontWeight: "bold",
//       fontSize:50,
//       color:"#fb5b5a",
//       marginBottom: 40,
//       },

//       inputView:{
//         width:"80%",
//         backgroundColor:"#3AB4BA",
//         borderRadius:10,
//         height:50,
//         marginBottom:20,
//         justifyContent:"center",
//         padding:20
//         },
//         inputText:{
//         height:50,
//         color:"white"
//         },

//         button: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 12,
//         paddingHorizontal: 32,
//         borderRadius: 4,
//         elevation: 3,
//         backgroundColor: 'lightgreen',
//         margin: 10,

//       },

//       button_active: {
//         "transition": "all 100ms ease",
//         "transform": "scale(1.05)",
//         "boxShadow": "0 0 8px rgba(0, 0, 0, 0.5)",
//         backgroundColor: 'blue',
//       },
//       text: {
//         fontSize: 16,
//         lineHeight: 21,
//         fontWeight: 'bold',
//         letterSpacing: 0.25,
//         color: 'blue',
//       },
//       logo: {
//         width: 100,
//         height: 100,
//         borderRadius : 10
//       },

// });

export default WelcomeScreen;
