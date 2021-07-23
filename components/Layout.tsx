import { Button, Container, Heading, Flex } from "@chakra-ui/react";

export default function Layout({ children }) {
  return (
    <>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding={6}
        bg="teal.500"
        color="white"
      >
        <Flex align="center" mr={5}>
          <Heading as="h1" size="lg" letterSpacing={"tighter"}>
            Navbar
          </Heading>
        </Flex>
        <Flex>
          <Button colorScheme="white" outlineColor="blue">
            Button
          </Button>
        </Flex>
      </Flex>
      <Container>{children}</Container>
    </>
  );
}
