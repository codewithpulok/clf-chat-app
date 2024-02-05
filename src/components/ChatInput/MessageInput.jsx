import { useCallback } from "react";
import useMessageCreate from "../../hooks/message/useMessageCreate";
import useChat from "../../hooks/useChat";
import ChatForm from "./ChatForm";

const Props = {};

/**
 * @param {Props} props
 * @returns {JSX.Element}
 */
const MessageInput = () => {
  const { chatId, chatType } = useChat();

  // api state
  const [createMessage] = useMessageCreate();

  const onSubmit = useCallback(
    async ({ file, text }, reset) => {
      if (!file && !text) return;

      const response = await createMessage(text, file, chatId, chatType);

      console.log("Message Create:", response);

      reset();
    },
    [chatId, chatType, createMessage]
  );

  return <ChatForm onSubmit={onSubmit} />;
};

MessageInput.propTypes = Props;

export default MessageInput;
