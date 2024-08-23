const { Pool } = require("pg");

// PostgreSQL 연결 설정
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "pension_db",
  password: "postgres",
  port: 5432,
});

async function saveNaverbooking(reservationInfo) {
  const query = `
    INSERT INTO bookings (
      reservation_number, name, application_date, reservation_product,
      usage_date, payment_status, payment_method, payment_amount, source
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;

  const values = [
    reservationInfo.reservationNumber,
    reservationInfo.name,
    reservationInfo.applicationDate,
    reservationInfo.reservationProduct,
    reservationInfo.usageDate,
    reservationInfo.paymentStatus,
    reservationInfo.paymentMethod,
    reservationInfo.paymentAmount,
    "naverbooking",
  ];

  try {
    await pool.query(query, values);
    console.log("Booking saved to the database");
  } catch (error) {
    console.error("Error saving booking to the database:", error);
  }
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

module.exports = { saveNaverbooking, parseNaverbooking };
