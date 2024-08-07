const emailHelpers = require("../utils/gmail");

const options = {
  to: "slrttt2001@naver.com",
  subject: "테스트1 ✅",
  html: `The programming tv is <a href="https://okdevtv.com" target="_blank">OKdevTV.com</a>`,
};

emailHelpers.sendCustom(options);
