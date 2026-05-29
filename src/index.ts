import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";

// ❇️ 7주차 미들웨어
import morgan from 'morgan'; 
import cookieParser from 'cookie-parser';


// ❇️ 7주차 tsoa 방식
// tsoa로 생성된 라우트 등록 함수 import
// 왜? tsoa는 컨트롤러의 메서드에 @Route, @Post, @Body 등 데코레이터를 사용하여 API 엔드포인트와 요청/응답 형식을 정의합니다. 그리고 tsoa CLI를 사용하여 이 정보를 기반으로 자동으로 라우트 핸들러 코드를 생성합니다. 이 생성된 코드에는 각 API 엔드포인트에 대한 라우트 핸들러가 포함되어 있으며, 이 핸들러는 컨트롤러의 메서드를 호출하도록 구현되어 있습니다. 따라서 우리가 직접 라우트를 정의할 필요 없이, tsoa가 생성한 라우트를 등록하는 함수만 호출하면 됩니다
import {RegisterRoutes} from "./generated/routes.js"; // tsoa로 생성된 라우트 등록 함수 import
import { AppError } from "./common/errors/AppError.js";

// ☑️ controller 의 handler 함수 import
/*
import { handleUserSignUp } from "./modules/users/controllers/user.controller.js";
import { handleListStoreReviews, handleAddReview, handleListMyReviews } from "./modules/reviews/controllers/review.controller.js";
import { handleAddMission, handleChallengeMission, handleGetMissionsByStore, handleGetMissionByUser } from "./modules/missions/controllers/mission.controller.js";
*/

// ❇️ 8주차 : swagger
import swaggerUi from "swagger-ui-express";
import cors from "cors"; // 미들웨어

import path from "path";
import fs from "fs";

// ❇️ 9주차 : auth
import passport from "passport";
import { googleStrategy, jwtStrategy } from "./auth.config.js";
import { prisma } from "./db.config.js";


/**
 * ========================================
 * Express 기반 Node.js 서버 진입점
 * 사용자 회원가입, 스토어 리뷰/미션 관리 REST API 서버
 * ========================================
 */

// 1️⃣ 환경 변수 설정
// .env 파일에서 환경 변수를 로드합니다 (포트 번호, DB 연결 정보 등)
dotenv.config();

// ❇️ passport 라이브러리에 로그인 방식을 등록
passport.use(googleStrategy); // Google 로그인 방식을 등록
passport.use(jwtStrategy); // jwtStrategy 등록


// 2️⃣ Express 앱 초기화
// Express 서버 인스턴스를 생성하고 포트를 설정합니다
const app: Express = express();
const port = process.env.PORT || 3000;

// 3️⃣ 미들웨어 설정(등록))
// cors(): 다른 도메인의 요청 허용
// express.static(): /public 폴더의 정적 파일 제공
// express.json(): JSON 형태의 요청 body를 파싱하기 위함
// express.urlencoded(): URL-encoded 데이터 파싱
app.use(cors());            // 8️⃣주차 : cors 방식 허용 - 서로 다른 주소에 있는 서버와 웹 사이트들이 통신 허용          
app.use(express.static('public'));    // 정적 파일 접근    

// ❇️ req.body 에 클라이언트가 보낸 데이터를 파싱해서 넣어주는, 아주 중요한 미들웨어
app.use(express.json());              // request의 본문을 json으로 해석할 수 있도록 함(JSON 형태의 요청 body를 파싱하기 위함)     
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

app.use(morgan('dev'));  // 로그 포맷: dev
app.use(cookieParser()); // ❇️ 요청에 포함된 쿠키 정보가 자동으로 파싱되어 req.cookies 객체에 저장

// 4️⃣ API 라우트 정의

// ❇️ 7주차 tsoa 방식으로 라우트 등록하기
const router = express.Router(); // ❇️ 7주차
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

// 5️⃣ 전역 에러 핸들러 (AppError → 표준 실패 응답)
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      resultType: "FAIL",
      error: { errorCode: err.errorCode, reason: err.message, data: err.data ?? null },
      success: null,
    });
  } else {
    res.status(500).json({
      resultType: "FAIL",
      error: { errorCode: "UNKNOWN", reason: err.message, data: null },
      success: null,
    });
  }
});


// ❇️ 8주차 swagger 세팅
const swaggerFile = JSON.parse( // 1. TSOA가 생성한 swagger.json 읽어오기
  fs.readFileSync(path.resolve("dist/swagger.json"), "utf8")
);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile)); // 2. Swagger UI 연결


// ❇️ 9주차
app.use(passport.initialize());

// ✅ Google 로그인 시작: 브라우저에서 이 URL에 접속하면 Google 동의 화면으로 이동
app.get(
  '/oauth2/login/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// ✅ Google 로그인 콜백: 동의 완료 후 Google이 이 URL로 리다이렉트
app.get(
  '/oauth2/callback/google',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // googleStrategy의 cb(null, tokens) 에서 넘긴 tokens 객체가 req.user에 담김
    res.status(200).json(req.user);
  }
);

// 보호된 라우트(Test) 만들고 `isLogin` 미들웨어 적용
// -> 이제 7주차의 `isLogin` 역할을 `passport.authenticate('jwt', ...)` 가 대신
const isLogin = passport.authenticate('jwt', { session: false });

app.get('/mypage', isLogin, (req, res) => {

  if (!req.user) {
    res.status(401).json({ message: "인증 실패" });
    return;
  }

  // passport-jwt가 req.user에 Prisma User 객체를 담아주지만,
  // Express 타입은 이를 모르므로 명시적으로 캐스팅
  // id는 BigInt라 JSON 직렬화가 안 되므로 Number()로 변환
  const user = req.user as { id: bigint; name: string; email: string };
  res.status(200).json({
    message: `인증 성공! ${user.name}님의 마이페이지입니다.`,
    user: { ...user, id: Number(user.id) },
  });
});


// 6️⃣ 서버 실행
// 설정된 포트에서 서버를 시작하고 요청을 대기합니다
app.listen(port, () => {
  console.log(`[server]: Server is running at <http://localhost>:${port}`);
});