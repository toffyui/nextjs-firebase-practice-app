import { useRouter } from "next/router";
import { useEffect, useState, FormEvent } from "react";
import { User } from "../../models/User";
import firebase from "firebase/app";
import {
  Box,
  Heading,
  Text,
  FormControl,
  Center,
  Button,
  Textarea,
} from "@chakra-ui/react";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";

type Query = {
  uid: string;
};

export default function UserShow() {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const query = router.query as Query;
  useEffect(() => {
    if (query.uid === undefined) {
      return;
    }
    async function loadUser() {
      const doc = await firebase
        .firestore()
        .collection("users")
        .doc(query.uid)
        .get();

      if (!doc.exists) {
        return;
      }

      const gotUser = doc.data() as User;
      gotUser.uid = doc.id;
      setUser(gotUser);
    }
    loadUser();
  }, [query.uid]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    setIsSending(true);
    await firebase.firestore().collection("questions").add({
      senderUid: firebase.auth().currentUser.uid,
      receiverUid: user.uid,
      body,
      isReplied: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setIsSending(false);
    toast.success("質問を送信しました。", {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setBody("");
  }

  return (
    <Layout>
      {user && (
        <Box mt={4}>
          <Heading as="h4" size="lg">
            {user.name}さんのページ
          </Heading>
          <Text my={4}>{user.name}さんに質問しよう！</Text>
          <form onSubmit={onSubmit}>
            <FormControl>
              <Textarea
                id="name"
                placeholder="おげんきですか？"
                onChange={(e) => setBody(e.target.value)}
                value={body}
              />
            </FormControl>
            <Center my={4}>
              {isSending ? (
                <Button isLoading colorScheme="teal" variant="solid">
                  Email
                </Button>
              ) : (
                <Button colorScheme="teal" type="submit">
                  送信する
                </Button>
              )}
            </Center>
          </form>
        </Box>
      )}
    </Layout>
  );
}
