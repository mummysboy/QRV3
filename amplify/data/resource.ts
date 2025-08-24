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
      neighborhood: a.string(), // Store business neighborhood at card creation
      expires: a.string(),
      businessId: a.string(), // Link to business
    })
    .identifier(["cardid"])
    .authorization((allow) => [allow.publicApiKey()]),

  CardView: a
    .model({
      id: a.id().required(),
      cardid: a.string().required(),
      businessId: a.string(),
      viewed_at: a.string().required(),
      ip_address: a.string(),
      user_agent: a.string(),
    })
    .identifier(["id"])
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
      redeemed_at: a.string(),
      businessId: a.string(), // Link to business
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey().to(["read", "create", "update", "delete"])]),

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
      businessName: a.string(),
      businessAddress: a.string(),
      businessCity: a.string(),
      businessState: a.string(),
      businessZipCode: a.string(),
      businessCategory: a.string(),
      businessLogo: a.string(),
      status: a.string(),
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
      status: a.string().required(),
      logo: a.string(),
      address: a.string().required(),
      city: a.string().required(),
      state: a.string().required(),
      neighborhood: a.string(), // AI-detected neighborhood name
      website: a.string(),
      socialMedia: a.string(),
      businessHours: a.string(),
      description: a.string(),
      photos: a.string(),
      primaryContactEmail: a.string(),
      primaryContactPhone: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
      approvedAt: a.string(),
      approvedBy: a.string(),
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey()]),

  BusinessUser: a
    .model({
      id: a.id().required(),
      email: a.string().required(),
      password: a.string().required(), // <--- Restored field
      firstName: a.string().required(),
      lastName: a.string().required(),
      role: a.string().required(),
      status: a.string().required(),
      businessId: a.string().required(),
      lastLoginAt: a.string(), // <--- Restored field (optional)
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .identifier(["id"])
    .authorization((allow) => [allow.publicApiKey()]),

  AdminUser: a
    .model({
      id: a.string().required(),
      username: a.string().required(),
      email: a.string().required(),
      password: a.string().required(),
      phoneNumber: a.string(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      role: a.string().required(),
      status: a.string().required(),
      lastLoginAt: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
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
