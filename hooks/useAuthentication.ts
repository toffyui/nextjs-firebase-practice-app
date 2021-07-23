import firebase from "firebase/app";
import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";
import { User } from "../models/User";

const userState = atom<User>({
  key: "user",
  default: null,
});

async function createUserIfNotFound(user: User) {
  const userRef = firebase.firestore().collection("users").doc(user.uid);
  const doc = await userRef.get();
  if (doc.exists) {
    return;
  }

  await userRef.set({
    name: "taro" + new Date().getTime(),
  });
}

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    if (user !== null) {
      return;
    }
    firebase
      .auth()
      .signInAnonymously()
      .catch(function (error) {
        // Handle Errors here.
        console.error(error);
      });

    firebase.auth().onAuthStateChanged(function (firebaseUser) {
      if (firebaseUser) {
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: "",
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser);
      } else {
        // User is signed out.
        setUser(null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user };
}
