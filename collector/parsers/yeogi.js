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

module.exports = parseYeogi;
