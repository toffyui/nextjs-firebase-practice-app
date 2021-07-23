import { RecoilRoot } from "recoil";
import { ChakraProvider } from "@chakra-ui/react";
import "../lib/firebase";
import "../styles/globals.css";

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
