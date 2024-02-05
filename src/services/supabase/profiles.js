import { supabase } from ".";
import { supabaseTables } from "../../config/supabase.config";

// get profiles
export const getProfiles = async () => {
  try {
    const response = await supabase.from(supabaseTables.profiles).select("*");
    const { data, error } = response;

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Get Profiles Error: ", error);
    return { error };
  }
};
