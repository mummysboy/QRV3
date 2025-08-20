import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "qrewards-media",
  accessControl: "public",
});

