const { Pool } = require("pg");
const puppeteer = require("puppeteer");

// PostgreSQL 연결 설정
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "pension_db",
  password: "postgres",
  port: 5432,
});

async function saveYeogi(reservationInfo) {
  const query = `
    INSERT INTO bookings (
      reservation_number, name, application_date, reservation_product,
      usage_date, payment_status, payment_method, payment_amount, source
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ;
  `;

  const values = [
    reservationInfo.reservationNumber,
    reservationInfo.guestName,
    reservationInfo.paymentDate,
    reservationInfo.roomType,
    `${reservationInfo.checkIn} ~ ${reservationInfo.checkOut}`,
    "-",
    "-",
    reservationInfo.estimatedSettlementAmount,
    "yeogi",
  ];

  try {
    await pool.query(query, values);
    console.log("Booking saved to the database");
  } catch (error) {
    console.error("Error saving booking to the database:", error);
  }
}

async function parseYeogi(emailBody) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(emailBody);

  const reservationInfo = {};

  // 정보 추출 헬퍼 함수
  const extractInfo = async (selector, label) => {
    return page.evaluate(
      (sel, lab) => {
        const element = document.querySelector(sel);
        if (element) {
          const text = element.textContent.trim();
          return text.replace(lab, "").trim();
        }
        return "";
      },
      selector,
      label
    );
  };

  // 텍스트를 포함하는 요소를 찾는 헬퍼 함수
  const findElementByText = async (tag, text) => {
    return page.evaluate(
      (t, txt) => {
        const elements = Array.from(document.getElementsByTagName(t));
        return (
          elements
            .find((el) => el.textContent.includes(txt))
            ?.textContent.split(":")[1]
            ?.trim() || ""
        );
      },
      tag,
      text
    );
  };

  // 예약 정보 추출
  reservationInfo.accommodationName = await extractInfo(
    'td[style*="font-weight: 700"]',
    "제휴점명 : "
  );
  reservationInfo.reservationNumber = await extractInfo(
    "td:nth-of-type(2)",
    "예약번호 :"
  );
  reservationInfo.paymentDate = await extractInfo(
    "td:nth-of-type(3)",
    "결제일 :"
  );
  reservationInfo.cancellationDate = await extractInfo(
    "td:nth-of-type(4)",
    "취소일 :"
  );

  // 객실 정보 추출
  reservationInfo.roomType = await findElementByText("li", "객실명:");

  // 추가 옵션 추출
  reservationInfo.additionalOptions = await findElementByText(
    "li",
    "추가옵션:"
  );

  // 예약 세부 정보 추출
  const extractTableInfo = async (label) => {
    return page.evaluate((lab) => {
      const rows = document.querySelectorAll("table tr");
      for (let row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells[0] && cells[0].textContent.includes(lab)) {
          return cells[1] ? cells[1].textContent.trim() : "";
        }
      }
      return "";
    }, label);
  };

  reservationInfo.checkIn = await extractTableInfo("체크인");
  reservationInfo.checkOut = await extractTableInfo("체크아웃");
  reservationInfo.stayDuration = await extractTableInfo("투숙기간");
  reservationInfo.guestName = await extractTableInfo("고객명");
  reservationInfo.contactNumber = await extractTableInfo("연락처");

  // 취소 정보 추출
  reservationInfo.cancellationFeeRate = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("td.info-table__td"));
    const element = elements.find((el) => el.textContent.includes("%"));
    return element ? element.textContent.trim() : "";
  });

  reservationInfo.estimatedSettlementAmount = await findElementByText(
    "li",
    "총 정산 예정금액:"
  );

  await browser.close();

  console.log(reservationInfo);

  return reservationInfo;
}

module.exports = { saveYeogi, parseYeogi };
