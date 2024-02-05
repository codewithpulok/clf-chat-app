import { supabase } from ".";
import { supabaseTables } from "../../config/supabase.config";

// get channels
export const getChannels = async () => {
  try {
    const response = await supabase.from(supabaseTables.channels).select("*");
    const { data, error } = response;

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Get Channels Error: ", error);
    return { error };
  }
};

// get channel
export const getChannel = async (id) => {
  try {
    const response = await supabase
      .from(supabaseTables.channels)
      .select("*")
      .eq("id", id)
      .single();
    const { data, error } = response;

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Get Channel By id Error: ", error);
    return { error };
  }
};
