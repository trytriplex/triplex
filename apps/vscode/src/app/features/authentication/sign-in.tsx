/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useTelemetry } from "@triplex/ux";
import { use, useReducer, useState } from "react";
import invariant from "tiny-invariant";
import { AuthenticationClientContext } from "./context";
import { SignInForm } from "./sign-in-form";

export function SignIn() {
  const client = use(AuthenticationClientContext);
  const telemetry = useTelemetry();
  const [state, setState] = useState<"sign-in" | "check-email">("sign-in");
  const [resetKey, resetForm] = useReducer((prev) => prev + 1, 0);
  const [error, setError] = useState("");

  invariant(client, "AuthenticationClientContext is not available.");

  const onResetHandler = () => {
    setState("sign-in");
    setError("");
    resetForm();
  };

  const signInHandlerAction = async ({
    email,
    token,
  }: {
    email: string;
    token: string;
  }) => {
    setError("");

    if (state === "sign-in") {
      if (email) {
        telemetry.event("dialog_auth_otp_send");

        const result = await client.signInWithOtp({
          email,
        });

        if (result.error) {
          telemetry.event("dialog_auth_otp_send");
          setState("sign-in");
          setError(result.error.message.toLocaleLowerCase());
        } else {
          telemetry.event("dialog_auth_otp_send_success");
          setState("check-email");
        }
      }
    } else if (state === "check-email") {
      if (email && token) {
        telemetry.event("dialog_auth_otp_verify");

        const result = await client.verifyOtp({
          email,
          token,
          type: "email",
        });

        if (result.error) {
          telemetry.event("dialog_auth_otp_verify_error");
          setState("check-email");
          setError(result.error.message.toLocaleLowerCase());
        } else {
          telemetry.event("dialog_auth_otp_verify_success");
        }
      }
    }
  };

  return (
    <SignInForm
      action={signInHandlerAction}
      error={error}
      key={resetKey}
      onRequestReset={onResetHandler}
      state={state}
    />
  );
}
