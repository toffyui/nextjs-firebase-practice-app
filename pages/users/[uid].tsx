import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "../../models/User";
import firebase from "firebase/app";
import { Box, Heading, Text } from "@chakra-ui/react";
import Layout from "../../components/Layout";

type Query = {
  uid: string;
};

export default function UserShow() {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();
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
  return (
    <Layout>
      {user && (
        <Box>
          <Heading as="h4" size="lg">
            {user.name}さんのページ
          </Heading>
          <Text>{user.name}さんに質問しよう！</Text>
        </Box>
      )}
    </Layout>
  );
}
