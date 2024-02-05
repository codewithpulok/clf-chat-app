import { useCallback, useMemo, useState } from "react";
import { supabaseFolders } from "../../config/supabase.config";
import {
  addReplayAttachments,
  createReplay,
  deleteChatFiles,
  deleteReplay,
  uploadChatFile,
} from "../../services/supabase";

const useReplayCreate = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState(undefined);

  const action = useCallback(async (text, file, messageId, channelId) => {
    // message id
    let replayId;
    // uploaded files
    let files = [];

    try {
      // reset state
      setIsLoading(true);
      setIsError(false);
      setData(undefined);

      // file path
      const tempFilePaths = [];

      // object url
      if (file) tempFilePaths.push(URL.createObjectURL(file));

      const createResponse = await createReplay(text, tempFilePaths, messageId);

      // if there is error then stop execution
      if (createResponse?.error) throw createResponse.error;

      // update id
      if (!createResponse?.data?.id) throw new Error("Replay id not found");
      replayId = createResponse?.data?.id;

      // if there is no file path the stop execution and return
      if (!tempFilePaths) return { data: createResponse.data };

      // upload attached file
      const uploadResponse = await uploadChatFile(
        file,
        supabaseFolders.channel,
        channelId,
        replayId
      );

      // if there is upload error then stop execution
      if (uploadResponse?.error || !uploadResponse?.data?.path)
        throw uploadResponse?.error;

      files.push(uploadResponse?.data?.fullPath);

      const updateResponse = await addReplayAttachments(replayId, files);

      // if there is update error then stop execution
      if (updateResponse?.error || !updateResponse.data)
        throw updateResponse?.error;

      return { data: updateResponse?.data };
    } catch (error) {
      console.log("Error:", error);

      // delete uploaded files - if uploaded
      if (files?.length) deleteChatFiles(files);

      // delete if there is any error
      if (replayId) deleteReplay(replayId);

      setIsError(true);
      setIsLoading(false);
      return { error };
    }
  }, []);

  const states = useMemo(
    () => ({
      isLoading,
      isError,
      data,
    }),
    [data, isError, isLoading]
  );

  return [action, states];
};

export default useReplayCreate;
