import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";

import { handleUserSignUp } from "./modules/users/controllers/user.controller.js"; //
import { handleAddReview, handleAddMission, handleChallengeMission } from "./modules/stores/controllers/store.controller.js"; // ✅ week05-mission

/**
 * ========================================
 * Express 기반 Node.js 서버 진입점
 * 사용자 회원가입, 스토어 리뷰/미션 관리 REST API 서버
 * ========================================
 */

// 1️⃣ 환경 변수 설정
// .env 파일에서 환경 변수를 로드합니다 (포트 번호, DB 연결 정보 등)
dotenv.config();

// 2️⃣ Express 앱 초기화
// Express 서버 인스턴스를 생성하고 포트를 설정합니다
const app: Express = express();
const port = process.env.PORT || 3000;

// 3️⃣ 미들웨어 설정
// cors(): 다른 도메인의 요청 허용
// express.static(): /public 폴더의 정적 파일 제공
// express.json(): JSON 형태의 요청 body를 파싱하기 위함
// express.urlencoded(): URL-encoded 데이터 파싱
app.use(cors());            // cors 방식 허용                 
app.use(express.static('public'));    // 정적 파일 접근      
app.use(express.json());              // request의 본문을 json으로 해석할 수 있도록 함(JSON 형태의 요청 body를 파싱하기 위함)     
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

// 4️⃣ API 라우트 정의
// 각 엔드포인트별로 컨트롤러 함수를 연결합니다
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is TypeScript Server!");
});

// POST 라우트들
app.post("/api/v1/stores/reviews", handleAddReview); // 5️⃣ 리뷰 추가
app.post("/api/v1/users/signup", handleUserSignUp); // 사용자 회원가입
app.post("/api/v1/stores/missions", handleAddMission); // 미션 추가
app.post("/api/v1/missions/challenge", handleChallengeMission); // 미션 도전

// 5️⃣ 서버 실행
// 설정된 포트에서 서버를 시작하고 요청을 대기합니다
app.listen(port, () => {
  console.log(`[server]: Server is running at <http://localhost>:${port}`);
});