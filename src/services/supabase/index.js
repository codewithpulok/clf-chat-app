import { createClient } from "@supabase/supabase-js";
import supabaseConfig from "../../config/supabase.config";

export const supabase = createClient(...supabaseConfig);

//  actions
export * from "./channels";
export * from "./dms";
export * from "./messages";
export * from "./profiles";
export * from "./replies";
export * from "./storage";
