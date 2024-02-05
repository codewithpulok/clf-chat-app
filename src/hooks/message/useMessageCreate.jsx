import { useCallback, useMemo, useState } from "react";
import { supabaseFolders } from "../../config/supabase.config";
import chatTypes from "../../constant/chatTypes";
import {
  addMessageAttachments,
  createMessage,
  deleteChatFiles,
  deleteMessage,
  uploadChatFile,
} from "../../services/supabase";

const useMessageCreate = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState(undefined);

  const action = useCallback(async (text, file, refId, refType) => {
    // message id
    let messageId;
    // uploaded files
    let files = [];

    try {
      // check upload folder
      let uploadFolder;
      if (refType === chatTypes.channel) uploadFolder = supabaseFolders.channel;
      if (refType === chatTypes.dm) uploadFolder = supabaseFolders.dm;

      if (!uploadFolder) throw new Error("Upload folder not found");

      // reset state
      setIsLoading(true);
      setIsError(false);
      setData(undefined);

      // file path
      const tempFilePaths = [];

      // object url
      if (file) tempFilePaths.push(URL.createObjectURL(file));

      const createResponse = await createMessage(
        text,
        tempFilePaths,
        refId,
        refType
      );

      // if there is error then stop execution
      if (createResponse?.error) throw createResponse.error;

      // update id
      if (!createResponse?.data?.id) throw new Error("Message id not found");
      messageId = createResponse?.data?.id;

      // if there is no file path the stop execution and return
      if (!tempFilePaths?.length) return { data: createResponse.data };

      // upload attached file
      const uploadResponse = await uploadChatFile(
        file,
        uploadFolder,
        refId,
        messageId
      );

      // if there is upload error then stop execution
      if (uploadResponse?.error || !uploadResponse?.data?.path)
        throw uploadResponse?.error;

      files.push(uploadResponse?.data?.fullPath);

      const updateResponse = await addMessageAttachments(messageId, files);

      // if there is update error then stop execution
      if (updateResponse?.error || !updateResponse.data)
        throw updateResponse?.error;

      return { data: updateResponse?.data };
    } catch (error) {
      console.log("Error:", error);

      // delete uploaded files - if uploaded
      if (files?.length) deleteChatFiles(files);

      // delete if there is any error
      if (messageId) deleteMessage(messageId);

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

export default useMessageCreate;
