import { defineFunction } from "@aws-amplify/backend";
export const uploadLogo = defineFunction({
    entry: "./handler.ts",
    environment: {
        BUCKET_NAME: "${storage.bucketName}",
    },
});
