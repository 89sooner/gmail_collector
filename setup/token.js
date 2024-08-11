require("dotenv").config();
const { google } = require("googleapis");

// Replace with the code you've got on

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  process.env.GMAIL_OAUTH_REDIRECT_URL
);

const code =
  "4/0AcvDMrDeUpGGhk8_S0EkdkN9iK-P5NJmtk5iyOzC0fcEIOwa0481ruaYZkpBrTrsSCZckw";
const getToken = async () => {
  const { tokens } = await oauth2Client.getToken(code);
  console.info(tokens);
};

getToken();
