import { useEffect, useState } from "react";
import { getDM } from "../services/supabase";
import useAuth from "./useAuth";

function useDM(reciever) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState(undefined);

  const fetchData = async (user1, user2) => {
    // reset state
    setIsLoading(true);
    setIsError(false);
    setData(undefined);

    const response = await getDM(user1, user2);

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

    console.log("DM", response);
  };

  useEffect(() => {
    if (reciever && user?.id) {
      fetchData(user?.id, reciever);
    }
  }, [reciever, user?.id]);

  return {
    isLoading,
    isError,
    data,
  };
}

export default useDM;
