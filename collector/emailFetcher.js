const { google } = require("googleapis");
const cheerio = require("cheerio");
const {
  saveNaverbooking,
  parseNaverbooking,
} = require("./parsers/naverbooking");
const { saveYeogi, parseYeogi } = require("./parsers/yeogi");

async function getEmails(auth, label, maxEmails = 10) {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    let pageToken = null;
    let allMessages = [];

    do {
      const res = await gmail.users.messages.list({
        userId: "me",
        labelIds: [label.id],
        pageToken: pageToken,
        q: label.name === "pension/airbnb" ? 'subject:"예약 알림"' : "",
      });

      allMessages = allMessages.concat(res.data.messages || []);
      pageToken = res.data.nextPageToken;
    } while (pageToken && allMessages.length < maxEmails);

    // 메시지를 날짜순으로 정렬 (오래된 순)
    allMessages.sort(
      (a, b) => parseInt(a.internalDate) - parseInt(b.internalDate)
    );

    // 원하는 개수만큼만 처리
    allMessages = allMessages.slice(0, maxEmails);

    console.log(
      `Processing ${allMessages.length} messages for label ${label.id}`
    );

    for (const message of allMessages) {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const headers = email.data.payload.headers;
      const subject = headers.find((header) => header.name === "Subject").value;
      const from = headers.find((header) => header.name === "From").value;

      let htmlBody = "";
      function getHtmlBody(payload) {
        if (payload.parts) {
          for (let part of payload.parts) {
            if (part.mimeType === "text/html") {
              htmlBody += Buffer.from(part.body.data, "base64").toString();
            } else if (part.parts) {
              getHtmlBody(part);
            }
          }
        } else if (payload.mimeType === "text/html" && payload.body.data) {
          htmlBody += Buffer.from(payload.body.data, "base64").toString();
        }
      }

      getHtmlBody(email.data.payload);

      console.log(`Subject: ${subject}`);
      console.log(`From: ${from}`);

      if (htmlBody) {
        const $ = cheerio.load(htmlBody);

        // console.log("HTML Content:");
        // console.log($.html()); // 전체 HTML 내용 출력

        // 예시: 특정 요소 추출
        console.log("\nExtracted Information:");
        let reservationInfo;

        switch (label.name) {
          case "pension/naverbooking":
            reservationInfo = parseNaverbooking($);
            await saveNaverbooking(reservationInfo);
            break;
          case "pension/airbnb":
            reservationInfo = parsers.airbnb($);
            break;
          case "pension/yeogi":
            const emailBody = $.html(); // 이메일 본문 전체를 문자열로 가져옵니다.
            const reservationInfo = parseYeogi(emailBody);
            // await saveYeogi(reservationInfo);

            break;
          case "pension/yanolja":
            reservationInfo = parsers.yanolja($);
            break;
          default:
            console.log("Unknown label, unable to parse.");
            continue;
        }

        console.log(reservationInfo);
        console.log("----------------------------");
      } else {
        console.log("No HTML content found in this email.");
      }
    }
  } catch (error) {
    console.error(`Error processing emails for label ${label.id}:`, error);
  }
}

module.exports = { getEmails };
