/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type AuthSession, type SupabaseClient } from "@supabase/supabase-js";
import { createContext } from "react";

export const AuthenticationContext = createContext<AuthSession | null>(null);

export const AuthenticationClientContext = createContext<
  SupabaseClient["auth"] | null
>(null);
