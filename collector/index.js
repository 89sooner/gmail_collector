const { authorize } = require("./auth");
const { listSpecificLabelsWithIds } = require("./labels");
const { getEmails } = require("./emailFetcher");

async function main() {
  try {
    const auth = await authorize();
    const desiredLabels = [
      "pension/naverbooking",
      "pension/airbnb",
      "pension/yeogi",
      "pension/yanolja",
    ];
    const labels = await listSpecificLabelsWithIds(auth, desiredLabels);

    for (const label of labels) {
      console.log(
        `Processing emails for label: ${label.name} (ID: ${label.id})`
      );
      try {
        await getEmails(auth, label, 1);
      } catch (error) {
        console.error(
          `Error processing label ${label.name} (${label.id}):`,
          error
        );
      }
    }
  } catch (error) {
    console.error("An error occurred in main:", error);
  }
}

main();
