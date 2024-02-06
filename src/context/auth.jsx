import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

const defaultValues = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  metadata: null,
  session: null,
  signout: async () => {},
};

export const AuthContext = React.createContext(defaultValues);

export const AuthProvider = (props) => {
  const [isLoading, setIsLoading] = useState(defaultValues.isLoading);
  const [isAuthenticated, setIsAuthenticated] = useState(
    defaultValues.isAuthenticated
  );
  const [user, setUser] = React.useState(defaultValues.user);
  const [metadata, setMetadata] = useState(defaultValues.metadata);
  const [session, setSession] = useState(defaultValues.session);
  console.log({ metadata });
  // handle auth state change
  useEffect(() => {
    // look for session on first render
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setMetadata(session?.user?.user_metadata || null);
      setUser(session?.user || null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // lookup every time when session changed
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setMetadata(session?.user?.user_metadata || null);
      setUser(session?.user || null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });
    const { subscription } = data;
    return () => subscription.unsubscribe();
  }, []);

  const signout = useCallback(async () => {
    const response = await supabase.auth.signOut();

    // reset the state
    setIsLoading(false);
    setSession(null);
    setIsAuthenticated(false);
    setMetadata(null);
    setUser(null);

    return response;
  }, []);

  const API_URL = "https://api-cfl.herokuapp.com/auth/local";

  const signIn = useCallback(async (data) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const res = await response.json();

      if (res?.jwt) {
        setSession(res.jwt);
        setIsAuthenticated(true);
        setUser(res.user);
      } else {
        setSession(null);
        setIsAuthenticated(false);
      }
      return res?.user;
    } catch (error) {
      console.log(error);
    }

    // try {
    //   const { user, session, error } = await supabase.auth.signInWithPassword(
    //     data
    //   );

    //   if (error) console.error("sign-in error:", error);

    //   setSession(session);
    //   setMetadata(session?.user?.user_metadata || null);
    //   setUser(user);
    //   setIsAuthenticated(true);
    //   setIsLoading(false);
    //   return { user, session };
    // } catch (error) {
    //   console.log("unexpected error during sign-in:", error);
    // }
  }, []);

  const value = useMemo(
    () => ({
      signout,
      signIn,
      isLoading,
      isAuthenticated,
      user,
      metadata,
      session,
    }),
    [isAuthenticated, isLoading, metadata, session, signout, signIn, user]
  );

  return <AuthContext.Provider value={value} {...props} />;
};
