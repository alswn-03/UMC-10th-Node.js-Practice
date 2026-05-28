import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";

// ❇️ 7주차 미들웨어
import morgan from 'morgan'; 
import cookieParser from 'cookie-parser';


// ❇️ 7주차 tsoa 방식
// tsoa로 생성된 라우트 등록 함수 import
// 왜? tsoa는 컨트롤러의 메서드에 @Route, @Post, @Body 등 데코레이터를 사용하여 API 엔드포인트와 요청/응답 형식을 정의합니다. 그리고 tsoa CLI를 사용하여 이 정보를 기반으로 자동으로 라우트 핸들러 코드를 생성합니다. 이 생성된 코드에는 각 API 엔드포인트에 대한 라우트 핸들러가 포함되어 있으며, 이 핸들러는 컨트롤러의 메서드를 호출하도록 구현되어 있습니다. 따라서 우리가 직접 라우트를 정의할 필요 없이, tsoa가 생성한 라우트를 등록하는 함수만 호출하면 됩니다
import {RegisterRoutes} from "./generated/routes.js"; // tsoa로 생성된 라우트 등록 함수 import

// ☑️ controller 의 handler 함수 import
/*
import { handleUserSignUp } from "./modules/users/controllers/user.controller.js";
import { handleListStoreReviews, handleAddReview, handleListMyReviews } from "./modules/reviews/controllers/review.controller.js";
import { handleAddMission, handleChallengeMission, handleGetMissionsByStore, handleGetMissionByUser } from "./modules/missions/controllers/mission.controller.js";
*/



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

// 3️⃣ 미들웨어 설정(등록))
// cors(): 다른 도메인의 요청 허용
// express.static(): /public 폴더의 정적 파일 제공
// express.json(): JSON 형태의 요청 body를 파싱하기 위함
// express.urlencoded(): URL-encoded 데이터 파싱
app.use(cors());            // cors 방식 허용                 
app.use(express.static('public'));    // 정적 파일 접근    

// ❇️ req.body 에 클라이언트가 보낸 데이터를 파싱해서 넣어주는, 아주 중요한 미들웨어
app.use(express.json());              // request의 본문을 json으로 해석할 수 있도록 함(JSON 형태의 요청 body를 파싱하기 위함)     
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

app.use(morgan('dev'));  // 로그 포맷: dev
app.use(cookieParser()); // ❇️ 요청에 포함된 쿠키 정보가 자동으로 파싱되어 req.cookies 객체에 저장


// 4️⃣ API 라우트 정의

// ❇️ 7주차 tsoa 방식으로 라우트 등록하기
const router = express.Router();
RegisterRoutes(router); // tsoa로 생성된 라우트 등록 함수 호출
app.use("/api/v1", router); // 등록된 라우트를 Express 앱에 적용 (공통 URL 경로 설정)

// ☑️ 각 엔드포인트별로 컨트롤러 함수를 연결합니다
/*
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is TypeScript Server!");
});

app.post("/api/v1/stores/missions", handleAddMission); // 미션 추가
app.post("/api/v1/missions/challenge", handleChallengeMission); // 미션 도전
app.get("/api/v1/stores/:storeId/missions", handleGetMissionsByStore); // 가게별 미션 목록 조회
app.get("/api/v1/me/missions", handleGetMissionByUser); // 내가 도전 중인 미션 목록 조회

app.get("/api/v1/stores/:storeId/reviews", handleListStoreReviews); // 리뷰 목록 조회(가게 기준)
app.get("/api/v1/me/reviews", handleListMyReviews); // 내가 작성한 리뷰 목록 조회
app.post("/api/v1/stores/reviews", handleAddReview); // 5️⃣ 리뷰 추가

app.post("/api/v1/users/signup", handleUserSignUp); // 사용자 회원가입
*/

// 5️⃣ 서버 실행
// 설정된 포트에서 서버를 시작하고 요청을 대기합니다
app.listen(port, () => {
  console.log(`[server]: Server is running at <http://localhost>:${port}`);
});