import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Card: a
    .model({
      cardid: a.string().required(),
      quantity: a.integer().required(),
      logokey: a.string(),
      header: a.string(),
      subheader: a.string(),
      addressurl: a.string(),
      addresstext: a.string(),
      expires: a.string(),
    })
    .identifier(["cardid"])
    .authorization((allow) => [allow.publicApiKey()]),

  ClaimedReward: a
    .model({
      id: a.string().required(),
      cardid: a.string().required(),
      email: a.string().required(),
      logokey: a.string(),
      header: a.string(),
      subheader: a.string(),
      addressurl: a.string(),
      addresstext: a.string(),
      expires: a.string(),
      claimed_at: a.string(),
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey()]),

  Contact: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      email: a.string().required(),
      message: a.string().required(),
      createdAt: a.string(),
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
