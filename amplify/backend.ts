import { defineBackend } from "@aws-amplify/backend";
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

export const backend = defineBackend({
  data,
  storage,
});

const apiStack = backend.createStack("api-stack");

const uploadLogoLambda = new Function(apiStack, "UploadLogoLambda", {
  runtime: Runtime.NODEJS_18_X,
  handler: "handler.handler",
  code: Code.fromAsset("./function/uploadLogo"), // path to your handler code
  environment: {
    BUCKET_NAME: "${storage.bucketName}", // or use storage output if available
  },
});

const logoApi = new RestApi(apiStack, "LogoApi", {
  restApiName: "LogoApi",
  deployOptions: { stageName: "dev" },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
  },
});

const lambdaIntegration = new LambdaIntegration(uploadLogoLambda);
const uploadLogoResource = logoApi.root.addResource("upload-logo");
uploadLogoResource.addMethod("POST", lambdaIntegration);

backend.addOutput({
  custom: {
    LogoApi: {
      endpoint: logoApi.url,
    },
  },
});
