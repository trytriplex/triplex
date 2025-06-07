/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useEvent } from "@triplex/lib";
import { TriplexLogo } from "@triplex/ux";
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../../components/button";
import { OTPInput } from "../../components/otp-input";

const FormRefContext = createContext<RefObject<HTMLFormElement | null>>({
  current: null,
});

interface SignInFormData {
  email: string;
  token: string;
}

function SignInInputs({
  formData,
  setFormData,
  state,
}: {
  formData: SignInFormData;
  setFormData: Dispatch<SetStateAction<SignInFormData>>;
  state: "sign-in" | "check-email";
}) {
  const { pending } = useFormStatus();
  const formRef = use(FormRefContext);

  useEffect(() => {
    if (
      formRef.current &&
      state === "check-email" &&
      formData.email &&
      formData.token.length === 6
    ) {
      formRef.current.requestSubmit();
    }
  }, [formData.email, formData.token.length, formRef, state]);

  return (
    <>
      {state === "sign-in" && (
        <input
          aria-label="Email"
          autoFocus
          className="text-input disabled:text-disabled focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-[9px] focus:outline-none disabled:cursor-not-allowed"
          disabled={pending}
          name="email"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Email"
          required
          type="text"
          value={formData.email}
        />
      )}
      {state === "check-email" && (
        <div className="w-full">
          <OTPInput
            isDisabled={pending}
            name="token"
            onChange={(value) => {
              if (value.length <= 6) {
                setFormData((prev) => ({ ...prev, token: value }));
              }
            }}
            value={formData.token}
          />
        </div>
      )}
      {state === "sign-in" && (
        <Button
          actionId="(UNSAFE_SKIP)"
          isDisabled={pending}
          type="submit"
          variant="cta"
        >
          Sign In
        </Button>
      )}
    </>
  );
}

export function SignInForm({
  action,
  error,
  onRequestReset,
  state = "sign-in",
}: {
  action?: (formData: { email: string; token: string }) => Promise<void> | void;
  error?: string;
  onRequestReset?: () => void;
  state?: "sign-in" | "check-email";
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    token: "",
  });

  const formActionHandler = useEvent(() => {
    return action?.(formData);
  });

  return (
    <div className="bg-overlay-top fixed inset-0 flex flex-col items-center justify-center gap-2">
      <FormRefContext value={formRef}>
        <form
          action={formActionHandler}
          className="flex w-full max-w-xs flex-col items-start gap-2"
          ref={formRef}
        >
          <TriplexLogo className="text-default mb-2 h-14" />
          <div className="text-heading select-none font-medium">
            Triplex for VS Code
          </div>
          <div className="select-none">
            You must sign in to work with private repositories.
          </div>
          <SignInInputs
            formData={formData}
            setFormData={setFormData}
            state={state}
          />
          {state === "sign-in" && (
            <div className="select-none">
              We'll email you a code to finish signing in. Don't have an
              account? One will be created when verified.
            </div>
          )}
          {state === "check-email" && (
            <div className="select-none">
              The code was sent to{"  "}
              <span className="font-medium">{formData.email}</span>. Didn't get
              it?{" "}
              <a className="text-link underline focus:outline-none" href="#">
                Send the code again
              </a>{" "}
              or{" "}
              <a
                className="text-link underline focus:outline-none"
                href="#"
                onClick={onRequestReset}
              >
                choose another email
              </a>
              .
            </div>
          )}
          {error && (
            <div className="text-danger flex select-none items-center gap-1">
              <ExclamationTriangleIcon className="flex-shrink-0" /> Couldn't
              sign in as {"   "}
              {error}.
            </div>
          )}
        </form>
      </FormRefContext>
    </div>
  );
}
