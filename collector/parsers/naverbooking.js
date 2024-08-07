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

module.exports = parseNaverbooking;
