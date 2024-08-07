const { google } = require("googleapis");
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return;
  }
  console.log("Labels:");
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}

async function listLabelsWithIds(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return;
  }
  console.log("Labels:");
  labels.forEach((label) => {
    console.log(`- ${label.name} (ID: ${label.id})`);
  });
}

async function listSpecificLabelsWithIds(auth, labelNames) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return [];
  }

  const specificLabels = labels.filter((label) =>
    labelNames.includes(label.name)
  );
  console.log("Specified Labels:");
  specificLabels.forEach((label) => {
    console.log(`- ${label.name} (ID: ${label.id})`);
  });

  return specificLabels.map((label) => ({
    id: label.id,
    name: label.name,
  }));
}

module.exports = { listLabels, listLabelsWithIds, listSpecificLabelsWithIds };
