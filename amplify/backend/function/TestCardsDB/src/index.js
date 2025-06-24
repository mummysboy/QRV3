const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.STORAGE_REWARDCARDSDB_NAME;

exports.handler = async (event) => {
  try {
    // Scan for all non-expired, available rewards
    const now = new Date().toISOString().split("T")[0]; // e.g. "2025-06-22"
    const scanParams = {
      TableName: tableName,
      FilterExpression: "quantity > :q AND expires >= :today",
      ExpressionAttributeValues: {
        ":q": 0,
        ":today": now,
      },
    };

    const result = await docClient.scan(scanParams).promise();
    const items = result.Items;

    // TEMPORARY insert block at the top of the handler
    const insertParams = {
      TableName: tableName,
      Item: {
        cardid: Date.now().toString(),
        header: "Free Starbucks Drink",
        subheader: "Valid at any Starbucks location",
        expires: "2025-12-31",
        quantity: 100,
        addresstext: "123 Brew St, Coffee City, HI",
        addressurl: "https://goo.gl/maps/starbucks",
        logokey: "public/logos/starbucks.png", // ← this is from your uploaded image
      },
    };

    // UNCOMMENT TO RUN THIS ONCE
    // await docClient.put(insertParams).promise();

    if (!items || items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No available cards" }),
      };
    }

    const selected = items[Math.floor(Math.random() * items.length)];
    return {
      statusCode: 200,
      body: JSON.stringify(selected),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", detail: err }),
    };
  }
};
