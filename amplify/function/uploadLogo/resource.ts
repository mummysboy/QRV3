import { defineFunction } from "@aws-amplify/backend";
import { storage } from "../../storage/resource";

export const uploadLogo = defineFunction({
  entry: "./handler.ts",
  environment: {
    BUCKET_NAME: "${storage.bucketName}",
  },
}); 