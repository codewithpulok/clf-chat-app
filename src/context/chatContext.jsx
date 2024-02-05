import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { supabaseTables } from "../config/supabase.config";
import chatTypes from "../constant/chatTypes";
import useMessages from "../hooks/message/useMessages";
import useReplies from "../hooks/replay/useReplies";
import useChannels from "../hooks/useChannels";
import useDM from "../hooks/useDM";
import useProfiles from "../hooks/useProfiles";
import { supabase } from "../services/supabase";

const defaultValues = {
  messages: {
    data: [],
    isLoading: true,
    isError: false,
  },
  replies: {
    data: [],
    isLoading: true,
    isError: false,
  },
  users: {
    data: [],
    isLoading: true,
    isError: false,
  },
  channels: {
    data: [],
    isLoading: true,
    isError: false,
  },
  chatType: null, // CHANNEL, DM
  chatId: null,
  threadId: null,
  updateChatId: () => {},
  updateThreadId: () => {},
};

export const ChatContext = createContext(defaultValues);

/**
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const ChatProvider = (props) => {
  const { children } = props;

  // url states
  const params = useParams();
  const urlChatId = params?.chatId;
  const urlChatType = params?.chatType;

  // app state
  const [chatId, setChatId] = useState(urlChatId || null);
  const [threadId, setThreadId] = useState(null);
  const [chatType, setChatType] = useState(urlChatType || null);

  // api state
  const dm = useDM(chatType === chatTypes.dm ? urlChatId : undefined);
  const users = useProfiles();
  const channels = useChannels();
  const messages = useMessages(chatId, chatType);
  const replies = useReplies(threadId);

  // update chat id
  const updateChatId = useCallback((id) => setChatId(id), []);
  // update thread id
  const updateThreadId = useCallback((id) => setThreadId(id), []);

  // update message
  const structureMessage = useCallback(
    (message) => {
      const profiles = users?.data?.find((p) => p.id === message.sender_id);

      if (!profiles) {
        console.log("User Profiles not updated");
        return message;
      }

      return { ...message, profiles };
    },
    [users?.data]
  );

  // invoke on url states
  useEffect(() => {
    if (urlChatId && urlChatType && chatTypes[urlChatType]) {
      setChatType(chatTypes[urlChatType]);
      if (dm.data?.id && chatTypes[urlChatType] === chatTypes.dm) {
        setChatId(dm?.data?.id);
      } else {
        setChatId(urlChatId);
      }
    }
  }, [dm.data?.id, urlChatId, urlChatType]);

  // update chat id
  useEffect(() => {}, []);

  // realtime chat feature
  useEffect(() => {
    // messages filter based on chat type
    let messagesFilter;
    if (chatType === chatTypes.channel) {
      messagesFilter = `channel_id=eq.${chatId}`;
    } else if (chatType === chatTypes.dm) {
      messagesFilter = `dm_id=eq.${chatId}`;
    }

    // replies filter based on thread id
    let repliesFilter;
    if (threadId) {
      repliesFilter = `message_id=eq.${threadId}`;
    }

    const channel = supabase
      .channel("CHAT")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: supabaseTables.profiles },
        (payload) => {
          const newProfile = payload.new;

          users.update((prev) => {
            const prevData = [...prev];

            if (!prev.find((profile) => profile.id === newProfile.id)) {
              prevData.push(newProfile);
            }

            return prevData;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: supabaseTables.messages,
          filter: messagesFilter,
        },
        (payload) => {
          const newMessage = payload.new;

          messages.update((prev) => {
            const prevM = [...prev];

            if (!prev.find((message) => message.id === newMessage.id)) {
              prevM.push(structureMessage(newMessage));
            }

            return prevM;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: supabaseTables.messages,
          filter: messagesFilter,
        },
        (payload) => {
          // console.log(payload);
          const oldMessage = payload.old;

          messages.update((prev) => {
            const prevM = [...prev].filter((i) => i?.id !== oldMessage?.id);

            return prevM;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: supabaseTables.messages,
          filter: messagesFilter,
        },
        (payload) => {
          // console.log(payload);
          const newMessage = payload.new;

          messages.update((prev) => {
            const prevM = [...prev];

            const updateIndex = prev.findIndex(
              (message) => message.id === newMessage.id
            );

            if (updateIndex !== -1) {
              const prevMessage = prev[updateIndex];
              const structure = { ...prevMessage, ...newMessage };
              structure.profiles = prevMessage?.profiles;
              prevM[updateIndex] = structure;
            }

            return prevM;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: supabaseTables.replies,
          filter: repliesFilter,
        },
        (payload) => {
          console.log(payload);
          const newReply = payload.new;

          replies.update((prev) => {
            const prevM = [...prev];

            if (!prev.find((message) => message.id === newReply.id)) {
              prevM.push(structureMessage(newReply));
            }

            return prevM;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: supabaseTables.replies,
          filter: repliesFilter,
        },
        (payload) => {
          // console.log(payload);
          const oldReplay = payload.old;

          replies.update((prev) => {
            const prevM = [...prev].filter((i) => i?.id !== oldReplay?.id);

            return prevM;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: supabaseTables.replies,
          filter: repliesFilter,
        },
        (payload) => {
          // console.log(payload);
          const newReplay = payload.new;

          messages.update((prev) => {
            const prevM = [...prev];

            const updateIndex = prev.findIndex(
              (replay) => replay.id === newReplay.id
            );

            if (updateIndex !== -1) {
              const prevReplay = prev[updateIndex];
              const structure = { ...prevReplay, ...newReplay };
              structure.profiles = prevReplay?.profiles;
              prevM[updateIndex] = structure;
            }

            return prevM;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      console.log("REMOVE CHANNEL: CHAT");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureMessage, threadId, chatId, chatType]);

  // memorized value
  const value = useMemo(
    () => ({
      users,
      channels,
      messages,
      replies,
      updateChatId,
      updateThreadId,
      chatId,
      threadId,
      chatType,
      dm,
    }),
    [
      channels,
      chatId,
      chatType,
      messages,
      replies,
      threadId,
      updateChatId,
      updateThreadId,
      users,
      dm,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const Props = {
  children: PropTypes.node,
};
ChatProvider.propTypes = Props;
