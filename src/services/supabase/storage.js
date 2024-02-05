import { supabase } from ".";
import { supabaseBuckets } from "../../config/supabase.config";
import getExtension from "../../utils/getExtension";

// upload chat file
export const uploadChatFile = async (file, parentFolder, subFolder, fileId) => {
  try {
    const extension = getExtension(file);
    if (!extension) throw new Error("Invalid file extension");

    const path = `${parentFolder}/${subFolder}/${fileId}.${extension}`;

    const response = await supabase.storage
      .from(supabaseBuckets.chat)
      .upload(path, file);

    const { data, error } = response;

    if (error) throw error;

    return { data };
  } catch (error) {
    console.log("Upload file error:", error);
    return { error };
  }
};

// delete chat files
export const deleteChatFiles = async (files) => {
  try {
    const response = await supabase.storage
      .from(supabaseBuckets.chat)
      .remove(files);

    const { data, error } = response;

    if (error) throw error;

    return { data };
  } catch (error) {
    console.log("Delete file error:", error);
    return { error };
  }
};
