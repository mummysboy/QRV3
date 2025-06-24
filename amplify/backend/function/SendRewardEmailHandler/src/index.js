const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  const { email, cardid, header, subheader, expires, logoUrl } = JSON.parse(
    event.body || "{}"
  );

  const client = new SESClient({ region: "us-west-2" }); // Update this to your SES region

  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <h2>🎉 Your QReward Has Been Claimed!</h2>
            <p><strong>${header}</strong></p>
            <p>${subheader}</p>
            <img src="${logoUrl}" style="max-width: 200px;" />
            <p><strong>Expires:</strong> ${expires}</p>
            <p><strong>Card ID:</strong> ${cardid}</p>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `You've claimed a reward: ${header} - ${subheader}. Expires: ${expires}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "🎁 Your QRewards Confirmation",
      },
    },
    Source: "rewards@qrewards.net", // <-- Must be verified in SES
  };

  try {
    await client.send(new SendEmailCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully." }),
    };
  } catch (err) {
    console.error("Email sending failed", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Email failed to send." }),
    };
  }
};
