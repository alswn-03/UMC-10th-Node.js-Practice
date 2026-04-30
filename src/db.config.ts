import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";



export const pool = mysql.createPool({ // MySQL DB에 연결하기 위해 Connection Pool을 생성하여 사용하는 코드
  host: process.env.DB_HOST || "localhost", // mysql의 hostname
  user: process.env.DB_USER || "root", // user 이름
  port: parseInt(process.env.DB_PORT || "3306"), // 포트 번호
  // 환경 변수는 기본적으로 문자열이에요. 숫자가 필요한 port 필드를 위해 parseInt로 형변환을 해줍니다! 


  database: process.env.DB_NAME, // 데이터베이스 이름
  password: process.env.DB_PASSWORD, // 비밀번호 
  // database: process.env.DB_NAME || "umc_10th", // 데이터베이스 이름
  // password: process.env.DB_PASSWORD || "password", // 비밀번호


  waitForConnections: true,
  // Pool에 획득할 수 있는 connection이 없을 때,
  // true면 요청을 queue에 넣고 connection을 사용할 수 있게 되면 요청을 실행하며, false이면 즉시 오류를 내보내고 다시 요청
  connectionLimit: 10, // 몇 개의 커넥션을 가지게끔 할 것인지
  queueLimit: 0, // getConnection에서 오류가 발생하기 전에 Pool에 대기할 요청의 개수 한도
});


// console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
// console.log("DB_NAME:", process.env.DB_NAME);