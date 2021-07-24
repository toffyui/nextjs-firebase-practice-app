import { useEffect, useRef, useState } from "react";
import firebase from "firebase/app";
import { Question } from "../../models/Question";
import Layout from "../../components/Layout";
import { useAuthentication } from "../../hooks/useAuthentication";
import { Box, Text, Flex } from "@chakra-ui/react";
import dayjs from "dayjs";
import Link from "next/link";

export default function QuestionsReceived() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { user } = useAuthentication();
  const [isPaginationFinished, setIsPaginationFinished] = useState(false);
  const scrollContainerRef = useRef(null);
  function createBaseQuery() {
    return firebase
      .firestore()
      .collection("questions")
      .where("receiverUid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(10);
  }

  function appendQuestions(
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  ) {
    const gotQuestions = snapshot.docs.map((doc) => {
      const question = doc.data() as Question;
      question.id = doc.id;
      return question;
    });
    setQuestions(questions.concat(gotQuestions));
  }

  async function loadQuestions() {
    const snapshot = await createBaseQuery().get();

    if (snapshot.empty) {
      setIsPaginationFinished(true);
      return;
    }

    appendQuestions(snapshot);
  }

  async function loadNextQuestions() {
    if (questions.length === 0) {
      return;
    }

    const lastQuestion = questions[questions.length - 1];
    const snapshot = await createBaseQuery()
      .startAfter(lastQuestion.createdAt)
      .get();

    if (snapshot.empty) {
      return;
    }

    appendQuestions(snapshot);
  }

  useEffect(() => {
    if (!process.browser) {
      return;
    }
    if (user === null) {
      return;
    }

    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process.browser, user]);

  function onScroll() {
    if (isPaginationFinished) {
      return;
    }

    const container = scrollContainerRef.current;
    if (container === null) {
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.top + rect.height > window.innerHeight) {
      return;
    }

    loadNextQuestions();
  }

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, scrollContainerRef.current, isPaginationFinished]);

  return (
    <Layout>
      <Text as="h1" fontSize="50px" align="center">
        受け取った質問一覧
      </Text>

      <Flex align="center" justify="center">
        <Box ref={scrollContainerRef}>
          {questions.map((question) => (
            <Link href={`/questions/${question.id}`} key={question.id}>
              <a>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  padding="5px"
                  width="400px"
                  my="4"
                  key={question.id}
                >
                  <Text fontSize="2xl">{question.body}</Text>
                  <Text fontSize="sm" align="right">
                    {dayjs(question.createdAt.toDate()).format(
                      "YYYY/MM/DD HH:mm"
                    )}
                  </Text>
                </Box>
              </a>
            </Link>
          ))}
        </Box>
      </Flex>
    </Layout>
  );
}
