import { createAuthClient } from "better-auth/react";

const BACKEND = import.meta.env.BACKEND_AUTH_URL;

if(!BACKEND){
  throw new Error("BACKEND AUTH URL not set")
}

export const authClient = createAuthClient({
  baseURL: BACKEND,
  fetchOptions: {
    credentials: "include",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
    },
  },
});