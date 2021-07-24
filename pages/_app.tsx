import { RecoilRoot } from "recoil";
import { ChakraProvider } from "@chakra-ui/react";
import "../lib/firebase";
import "../styles/globals.css";
import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </RecoilRoot>
  );
}

export default MyApp;
