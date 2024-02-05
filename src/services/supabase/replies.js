import { deleteChatFiles, supabase } from ".";
import { supabaseTables } from "../../config/supabase.config";

// get replies
export const getReplies = async (messageId) => {
  try {
    const response = await supabase
      .from(supabaseTables.replies)
      .select(`*, profiles(full_name, avatar, id)`)
      .eq("message_id", messageId);
    const { data, error } = response;

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error("Get Replies Error: ", error);
    return { error };
  }
};

// replay messsage function
export const createReplay = async (text, attachments, messageId) => {
  try {
    const reply = {
      text,
      message_id: messageId,
      attachments,
    };
    const response = await supabase
      .from(supabaseTables.replies)
      .insert(reply)
      .select();
    const { data, error } = response;

    if (error) throw error;
    return { data: data?.[0] || null };
  } catch (error) {
    console.error("Send Replay Error: ", error);
    return { error };
  }
};

// add replay attachments function
export const addReplayAttachments = async (replayId, attachments) => {
  try {
    const replay = {
      attachments,
    };
    const response = await supabase
      .from(supabaseTables.replies)
      .update(replay)
      .eq("id", replayId)
      .select();

    const { data, error } = response;

    if (error) throw error;
    return { data: data?.[0] || null };
  } catch (error) {
    console.error("Update Replay File Error: ", error);
    return { error };
  }
};

// delete replay function
export const deleteReplay = async (replayId, files) => {
  try {
    if (files?.length) await deleteChatFiles(files);
    const response = await supabase
      .from(supabaseTables.replies)
      .delete()
      .eq("id", replayId);
    const { data, error } = response;

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Delete Replay Error: ", error);
    return { error };
  }
};
