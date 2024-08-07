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

module.exports = parseAirbnb;
