import { supabase } from ".";
import { supabaseFunctions } from "../../config/supabase.config";

// get direct message
export const getDM = async (user_1, user_2) => {
  try {
    const response = await supabase.rpc(supabaseFunctions.getDM, {
      user1: user_1,
      user2: user_2,
    });
    const { data, error } = response;

    if (error) throw error;
    return { data: data?.[0] };
  } catch (error) {
    console.error("Get DM By user Error: ", error);
    return { error };
  }
};
