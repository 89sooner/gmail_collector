-- 예약 테이블
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  reservation_number VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  application_date TIMESTAMP NOT NULL,
  reservation_product VARCHAR(255) NOT NULL,
  usage_date DATE NOT NULL,
  payment_status VARCHAR(255) NOT NULL,
  payment_method VARCHAR(255) NOT NULL,
  payment_amount NUMERIC(10, 2) NOT NULL,
  source VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_bookings_reservation_number ON bookings (reservation_number);
CREATE INDEX idx_bookings_usage_date ON bookings (usage_date);


```
bookings 테이블은 네이버 예약, 에어비앤비, 여기어때, 야놀자 등 다양한 플랫폼에서 수집한 예약 정보를 저장합니다. 각 예약은 고유한 reservation_number를 가지고 있으며, 예약자 이름, 예약 신청 일시, 예약 상품, 이용 일시, 결제 상태, 결제 수단, 결제 금액 등의 정보를 포함합니다. source 컬럼은 예약 정보가 어떤 플랫폼에서 수집되었는지를 나타냅니다.
인덱스는 예약 번호(reservation_number)와 이용 일시(usage_date)에 대해 생성되어 있습니다. 이를 통해 해당 컬럼으로 빠른 검색이 가능합니다.
```