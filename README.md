# gmail_collector

## gmail API 인증 순서

### 01. generate

```shell
node setup/generate.js
```

- 터미널 창에 링크 클릭
- google 계정 및 API 권한 엑세스 로컬호스트에 연결할 수 없다는 에러 페이지 제공됨
- 해당 url을 복사하여 credentials에 추가
- 위에서 복사한 url에서 code=부터 &scope전까지 사이에 있는 값을 복사함

### 02. token

- 복사한 값을 token.js의 code = 값에 입력

```shell
node setup/token.js
```

- access_token, refresh_token, scope, token_type, expry_date가 추출됨
- 위에서 추출된 값을 .env에 입력하여 인증상태 업데이트
- token.js에도 refresh_toekn 업데이트
