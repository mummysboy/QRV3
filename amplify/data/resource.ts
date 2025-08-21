import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Card: a
    .model({
      cardid: a.string().required(), // Unique card ID
      quantity: a.integer().required(), // Remaining stock
      logokey: a.string(), // S3 key or full logo URL
      header: a.string(),
      subheader: a.string(),
      addressurl: a.string(),
      addresstext: a.string(),
      expires: a.string(),
      neighborhood: a.string(),
      businessId: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .identifier(["cardid"])
    .authorization([a.allow.public("apiKey")]),

  ClaimedReward: a
    .model({
      id: a.string().required(), // Unique ID (cardid + timestamp)
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
    .authorization([a.allow.public("apiKey")]),

  Business: a
    .model({
      id: a.string().required(),
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
      neighborhood: a.string(),
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
    .authorization([a.allow.public("apiKey")]),

  BusinessUser: a
    .model({
      id: a.string().required(),
      email: a.string().required(),
      password: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      role: a.string().required(),
      status: a.string().required(),
      businessId: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .authorization([a.allow.public("apiKey")]),

  BusinessAnalytics: a
    .model({
      id: a.string().required(),
      businessId: a.string().required(),
      views: a.integer(),
      claims: a.integer(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .authorization([a.allow.public("apiKey")]),

  User: a
    .model({
      id: a.string().required(),
      email: a.string().required(),
      password: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      phone: a.string(),
      zipCode: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .authorization([a.allow.public("apiKey")]),

  Signup: a
    .model({
      id: a.string().required(),
      email: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      phone: a.string(),
      zipCode: a.string(),
      status: a.string().required(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .authorization([a.allow.public("apiKey")]),

  // Contact: a
  //   .model({
  //     id: a.string().required(),
  //     name: a.string().required(),
  //     email: a.string().required(),
  //     message: a.string().required(),
  //     createdAt: a.string(),
  //     updatedAt: a.string(),
  //   })
  //   .authorization([a.allow.public("apiKey")]),

  CardView: a
    .model({
      id: a.string().required(),
      cardid: a.string().required(),
      ipAddress: a.string(),
      userAgent: a.string(),
      timestamp: a.string(),
      createdAt: a.string(),
    })
    .authorization([a.allow.public("apiKey")]),

  AdminUser: a
    .model({
      id: a.string().required(),
      email: a.string().required(),
      password: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      role: a.string().required(),
      status: a.string().required(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .authorization([a.allow.public("apiKey")]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});

