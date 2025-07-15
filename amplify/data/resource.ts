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
      businessId: a.string(), // Link to business
    })
    .identifier(["cardid"])
    .authorization((allow) => [allow.publicApiKey()]),

  ClaimedReward: a
    .model({
      id: a.string().required(),
      cardid: a.string().required(),
      email: a.string(),
      phone: a.string(),
      delivery_method: a.string(),
      logokey: a.string(),
      header: a.string(),
      subheader: a.string(),
      addressurl: a.string(),
      addresstext: a.string(),
      expires: a.string(),
      claimed_at: a.string(),
      businessId: a.string(), // Link to business
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

  Signup: a
    .model({
      id: a.id().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.string().required(),
      phone: a.string(),
      businessName: a.string().required(),
      businessAddress: a.string().required(),
      businessCity: a.string().required(),
      businessState: a.string().required(),
      businessZip: a.string().required(),
      status: a.string().default("pending"),
      createdAt: a.string(),
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey()]),

  Business: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      phone: a.string().required(),
      email: a.string().required(),
      zipCode: a.string().required(),
      category: a.string().required(),
      status: a.string().default("pending_approval"), // pending_approval, approved, rejected
      logo: a.string(), // S3 key for logo
      address: a.string().required(),
      city: a.string().required(),
      state: a.string().required(),
      website: a.string(),
      socialMedia: a.string(),
      businessHours: a.string(), // JSON string of hours
      description: a.string(),
      photos: a.string(), // JSON array of S3 keys
      primaryContactEmail: a.string(),
      primaryContactPhone: a.string(),
      profileComplete: a.boolean().default(false), // Track if profile is complete
      createdAt: a.string(),
      updatedAt: a.string(),
      approvedAt: a.string(),
      approvedBy: a.string(), // Admin user ID
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey()]),

  BusinessUser: a
    .model({
      id: a.id().required(),
      businessId: a.string().required(),
      email: a.string().required(),
      password: a.string().required(), // Will be hashed
      firstName: a.string().required(),
      lastName: a.string().required(),
      role: a.string().default("owner"), // owner, manager, staff
      status: a.string().default("active"), // active, inactive
      createdAt: a.string(),
      lastLoginAt: a.string(),
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey()]),

  BusinessAnalytics: a
    .model({
      id: a.id().required(),
      businessId: a.string().required(),
      date: a.string().required(),
      views: a.integer().default(0),
      claims: a.integer().default(0),
      redemptions: a.integer().default(0),
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
