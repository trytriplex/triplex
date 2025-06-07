/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createClient } from "@supabase/supabase-js";
import { startTransition, useEffect, useReducer, type ReactNode } from "react";
import { suspend } from "suspend-react";
import { AuthenticationClientContext, AuthenticationContext } from "./context";

const supabase = createClient(
  "https://nelqnoujvjyhsrhldrto.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHFub3Vqdmp5aHNyaGxkcnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzQyMzMsImV4cCI6MjA1NjcxMDIzM30.ol_nnrzzPiPbte3dFP9gHEiZz7fo34IfYs7crn60SIg",
);

export function AuthenticationProvider({ children }: { children?: ReactNode }) {
  const [refetchIndex, refetch] = useReducer((prev) => prev + 1, 0);
  const {
    data: { session },
    error,
  } = suspend(() => supabase.auth.getSession(), ["auth_session", refetchIndex]);

  useEffect(() => {
    return supabase.auth.onAuthStateChange(() => {
      startTransition(() => {
        refetch();
      });
    }).data.subscription.unsubscribe;
  }, []);

  if (error) {
    throw error;
  }

  return (
    <AuthenticationClientContext value={supabase.auth}>
      <AuthenticationContext value={session}>{children}</AuthenticationContext>
    </AuthenticationClientContext>
  );
}
