import { deleteChatFiles, supabase } from ".";
import { supabaseTables } from "../../config/supabase.config";
import chatTypes from "../../constant/chatTypes";

// get messages
export const getMessages = async (refId, refType) => {
  try {
    let query = supabase
      .from(supabaseTables.messages)
      .select(`*, profiles(full_name, avatar, id)`);

    if (refType === chatTypes.channel) query = query.eq("channel_id", refId);
    if (refType === chatTypes.dm) query = query.eq("dm_id", refId);

    const response = await query;
    const { data, error } = response;

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Get Messages Error: ", error);
    return { error };
  }
};

// send message function
export const createMessage = async (text, attachments, refId, refType) => {
  try {
    const message = {
      text,
      channel_id: refType === "CHANNEL" ? refId : undefined,
      dm_id: refType === "DM" ? refId : undefined,
      attachments,
    };
    const response = await supabase
      .from(supabaseTables.messages)
      .insert(message)
      .select();
    const { data, error } = response;

    if (error) throw error;
    return { data: data?.[0] || null };
  } catch (error) {
    console.error("Send Message Error: ", error);
    return { error };
  }
};

// add message attachments function
export const addMessageAttachments = async (messageId, attachments) => {
  try {
    const message = {
      attachments,
    };
    const response = await supabase
      .from(supabaseTables.messages)
      .update(message)
      .eq("id", messageId)
      .select();

    const { data, error } = response;

    if (error) throw error;
    return { data: data?.[0] || null };
  } catch (error) {
    console.error("Update Message File Error: ", error);
    return { error };
  }
};

// delete message function
export const deleteMessage = async (messageId, files) => {
  try {
    if (files?.length) await deleteChatFiles(files);
    const response = await supabase
      .from(supabaseTables.messages)
      .delete()
      .eq("id", messageId);
    const { data, error } = response;

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Delete Message Error: ", error);
    return { error };
  }
};
