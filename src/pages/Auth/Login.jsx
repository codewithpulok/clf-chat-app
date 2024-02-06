import {
  HStack,
  Image,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Box,
  Button,
  AbsoluteCenter,
  Divider,
} from "@chakra-ui/react";
import { SocialAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../services/supabase";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const { signIn } = useAuth();

  const onSubmit = async (data) => {
    try {
      const response = await signIn(data);
      console.log(response);
    } catch (error) {
      console.error("error during sign-in:", error);
    }
  };

  return (
    <HStack height={"100vh"} overflow={"scroll"}>
      <VStack
        flex={1.5}
        height={"100vh"}
        justifyContent={"center"}
        gap={"20px"}
      >
        <Image width={"300px"} src="/assets/images/Launch-Logo-Updated.png" />
        <Box width={"300px"}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" {...register("identifier")} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" {...register("password")} />
            </FormControl>
            <Button
              colorScheme="messenger"
              size="md"
              width={"100%"}
              marginTop={5}
              type="onsubmit"
            >
              Login
            </Button>
          </form>
          <Box position="relative" paddingTop="10">
            <Divider size="md" />
            <AbsoluteCenter bg="white" px="4" marginTop="5">
              or
            </AbsoluteCenter>
          </Box>
        </Box>
        <SocialAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
        />
      </VStack>
      <VStack
        flex={2}
        height={"100vh"}
        backgroundImage={
          "url(https://cofounderslab.com/assets/images/auth-splash.jpg)"
        }
        bgSize={"cover"}
        bgPosition={"center"}
      ></VStack>
    </HStack>
  );
};

export default LoginPage;
