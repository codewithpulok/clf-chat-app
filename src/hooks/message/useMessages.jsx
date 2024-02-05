import { useEffect, useState } from "react";
import { getMessages } from "../../services/supabase";

function useMessages(chatId, chatType) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = async (refId, refType) => {
    // reset state
    setIsLoading(true);
    setIsError(false);
    setData([]);

    const response = await getMessages(refId, refType);

    // handle error state
    if (response?.error) {
      setIsError(true);
    }
    // handle success state
    else {
      setData(response.data);
    }

    // stop loading state
    setIsLoading(false);
  };

  useEffect(() => {
    if (chatId && chatType) {
      fetchData(chatId, chatType);
    }
  }, [chatId, chatType]);

  return {
    isLoading,
    isError,
    data,
    update: setData,
  };
}

export default useMessages;
