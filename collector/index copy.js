const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const cheerio = require("cheerio");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

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

function parseNaverbooking($) {
  const reservationInfo = {};
  reservationInfo.name = $("td:contains('예약자명')").next().text().trim();
  reservationInfo.applicationDate = $("td:contains('예약신청 일시')")
    .next()
    .text()
    .trim();
  reservationInfo.reservationNumber = $("td:contains('예약번호')")
    .next()
    .text()
    .trim();
  reservationInfo.reservationProduct = $("td:contains('예약상품')")
    .next()
    .text()
    .trim();
  reservationInfo.usageDate = $("td:contains('이용일시')").next().text().trim();
  reservationInfo.paymentStatus = $("td:contains('결제상태')")
    .next()
    .text()
    .trim();
  reservationInfo.paymentMethod = $("td:contains('결제수단')")
    .next()
    .text()
    .trim();
  reservationInfo.paymentAmount = $("td:contains('결제금액')")
    .next()
    .text()
    .trim();
  return reservationInfo;
}

function parseAirbnb($) {
  const reservationInfo = {};
  // 예약자 이름
  reservationInfo.guestName = $('h1:contains("님이")').text().split(" ")[0];

  // 체크인 날짜
  reservationInfo.checkInDate = $('h1:contains("님이")')
    .text()
    .split("님이 ")[1]
    .split("에 체크인할")[0];

  // 숙소명
  reservationInfo.accommodationName = $('h2:contains("스위트")').text().trim();

  // 예약 번호
  reservationInfo.reservationNumber = $('p:contains("예약 번호")')
    .next()
    .text()
    .trim();

  // 체크인 날짜 및 시간
  reservationInfo.checkIn = $(".info-table__td").eq(0).text().trim();

  // 체크아웃 날짜 및 시간
  reservationInfo.checkOut = $(".info-table__td").eq(1).text().trim();

  // 투숙 기간
  reservationInfo.duration = $(".info-table__td").eq(2).text().trim();

  // 게스트 수
  reservationInfo.guests = $('p:contains("성인")').text().trim();

  // 총 결제 금액
  reservationInfo.totalAmount = $('h3:contains("총 금액")')
    .next()
    .text()
    .trim();

  // 호스트 수익
  reservationInfo.hostEarnings = $('h3:contains("호스트 수익")')
    .next()
    .text()
    .trim();

  return reservationInfo;
}

function parseYeogi($) {
  const reservationInfo = {};

  // 예약번호
  reservationInfo.reservationNumber = $("td:contains('예약번호 :')")
    .text()
    .split(":")[1]
    .trim();

  // 결제일
  reservationInfo.paymentDate = $("td:contains('결제일 :')")
    .text()
    .split(":")[1]
    .trim();

  // 숙소명
  reservationInfo.accommodationName = $("td:contains('제휴점명 :')")
    .text()
    .split(":")[1]
    .trim();

  // 체크인
  reservationInfo.checkIn = $(".info-table__td").eq(0).text().trim();

  // 체크아웃
  reservationInfo.checkOut = $(".info-table__td").eq(1).text().trim();

  // 투숙기간
  reservationInfo.stayDuration = $(".info-table__td").eq(2).text().trim();

  // 고객명
  reservationInfo.guestName = $(".info-table__td").eq(3).text().trim();

  // 연락처
  reservationInfo.contactNumber = $(".info-table__td").eq(4).text().trim();

  // 객실명
  reservationInfo.roomType = $(".info-table__td")
    .eq(6)
    .find("font")
    .first()
    .text()
    .trim();

  // 추가옵션
  reservationInfo.additionalOptions = $("td:contains('추가옵션')")
    .next()
    .text()
    .trim();

  // 총 판매가
  reservationInfo.totalPrice = $(".info-table__td").eq(12).text().trim();

  // 총 입금가
  reservationInfo.totalDeposit = $(".info-table__td").eq(13).text().trim();

  // 최종 매출가
  reservationInfo.finalSalesPrice = $(".info-table__td").eq(17).text().trim();

  return reservationInfo;
}

function parseYanolja($) {
  const reservationInfo = {};
  // 야놀자 특화 파싱 로직 구현
  return reservationInfo;
}

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

        console.log("HTML Content:");
        console.log($.html()); // 전체 HTML 내용 출력

        // 예시: 특정 요소 추출
        console.log("\nExtracted Information:");
        let reservationInfo;

        switch (label.name) {
          case "pension/naverbooking":
            reservationInfo = parseNaverbooking($);
            break;
          case "pension/airbnb":
            reservationInfo = parseAirbnb($);
            break;
          case "pension/yeogi":
            reservationInfo = parseYeogi($);
            break;
          case "pension/yanolja":
            reservationInfo = parseYanolja($);
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

async function main() {
  // authorize().then(listLabels).catch(console.error);
  // authorize().then(listLabelsWithIds).catch(console.error);

  try {
    const auth = await authorize();
    // 원하는 라벨 이름들을 배열로 지정
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
        await getEmails(auth, label, 1); // 각 라벨당 10개의 이메일을 처리
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
