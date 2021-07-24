import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import firebase from "firebase/app";
import Layout from "../../components/Layout";
import { Question } from "../../models/Question";
import { useAuthentication } from "../../hooks/useAuthentication";
import {
  Box,
  Text,
  FormControl,
  Textarea,
  Center,
  Button,
} from "@chakra-ui/react";
import { Answer } from "../../models/Answer";

type Query = {
  id: string;
};

export default function QuestionsShow() {
  const router = useRouter();
  const query = router.query as Query;
  const { user } = useAuthentication();
  const [question, setQuestion] = useState<Question>(null);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [answer, setAnswer] = useState<Answer>(null);

  async function loadData() {
    if (query.id === undefined) {
      return;
    }

    const questionDoc = await firebase
      .firestore()
      .collection("questions")
      .doc(query.id)
      .get();
    if (!questionDoc.exists) {
      return;
    }

    const gotQuestion = questionDoc.data() as Question;
    gotQuestion.id = questionDoc.id;
    setQuestion(gotQuestion);

    if (!gotQuestion.isReplied) {
      return;
    }

    const answerSnapshot = await firebase
      .firestore()
      .collection("answers")
      .where("questionId", "==", gotQuestion.id)
      .limit(1)
      .get();
    if (answerSnapshot.empty) {
      return;
    }

    const gotAnswer = answerSnapshot.docs[0].data() as Answer;
    gotAnswer.id = answerSnapshot.docs[0].id;
    const now = new Date().getTime();
    setAnswer({
      id: "",
      uid: user.uid,
      questionId: question.id,
      body,
      createdAt: new firebase.firestore.Timestamp(now / 1000, now % 1000),
    });
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSending(true);

    await firebase.firestore().runTransaction(async (t) => {
      t.set(firebase.firestore().collection("answers").doc(), {
        uid: user.uid,
        questionId: question.id,
        body,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      t.update(firebase.firestore().collection("questions").doc(question.id), {
        isReplied: true,
      });
    });
  }

  return (
    <Layout>
      {question && (
        <>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            padding="5px"
            width="400px"
            my="4"
          >
            {question && <Text fontSize="2xl">{question.body}</Text>}
          </Box>
          <Box mt={4}>
            <Text my={4}>回答</Text>
            {!answer ? (
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
                    <Button
                      isLoading
                      colorScheme="teal"
                      variant="solid"
                    ></Button>
                  ) : (
                    <Button colorScheme="teal" type="submit">
                      送信する
                    </Button>
                  )}
                </Center>
              </form>
            ) : (
              <Box
                borderWidth="1px"
                borderRadius="lg"
                padding="5px"
                width="400px"
                my="4"
              >
                <Text>{answer.body}</Text>
              </Box>
            )}
          </Box>
        </>
      )}
    </Layout>
  );
}
