// 인증과 관련한 구성 파일을 추가
// (1) JWT 토큰 생성 함수와 
// (2) Passport의 Google 로그인 전략을 정의

import dotenv from "dotenv";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwt from "jsonwebtoken";
import { prisma } from "./db.config.js"; // Prisma 설정 파일 경로 확인 필요

dotenv.config();


// ✅ Access Token과 Refresh Token을 생성하는 헬퍼 함수들을 정의

// 1. JWT 토큰 생성 함수 (타입 지정)
// Prisma의 id는 BigInt이므로 Number()로 변환 후 페이로드에 담음
// (BigInt는 JSON 직렬화 불가 → jwt.sign 내부에서 오류 발생)
export const generateAccessToken = (user: { id: bigint; email: string }) => {
  return jwt.sign(
    { id: Number(user.id), email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
};

export const generateRefreshToken = (user: { id: bigint }) => {
  return jwt.sign(
    { id: Number(user.id) },
    process.env.JWT_SECRET!,
    { expiresIn: "14d" }
  );
};



// ✅ Google 로그인 전략(Strategy) 정의

// 2. Google Verify 로직 
const googleVerify = async (profile: Profile) => {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new Error("Google 프로필에 이메일이 없습니다.");

  let user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
        data: {
            email,
            name: profile.displayName,
            gender: "추후 수정",
            birth: new Date(1970, 0, 1),
            address: "추후 수정",
            detailAddress: "추후 수정",
            phoneNumber: "추후 수정",
            // Google 로그인 사용자는 비밀번호가 없으므로 빈 문자열로 처리
            // (스키마에서 password는 NOT NULL 필수값)
            password: "",
        },
    });
  }

  return { id: user.id, email: user.email, name: user.name };
};

// 3. Google Strategy
export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID!,
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET!,
    callbackURL: "/oauth2/callback/google",
    scope: ["email", "profile"],
  },
  async (_accessToken, _refreshToken, profile, cb) => {
    try {
      const user = await googleVerify(profile);
      const tokens = {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
      };
      return cb(null, tokens);
    } catch (err) {
      return cb(err as Error);
    }
  }
);


// ✅ 테스트 해보기
// 1. JWT 검증 미들웨어 만들기( passport-jwt 사용)
export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
  },
  async (payload, done) => {
    try {
      // JWT 페이로드의 id는 Number로 저장되지만, Prisma의 id는 BigInt이므로 변환
      const user = await prisma.user.findFirst({ where: { id: BigInt(payload.id) } });
      return user ? done(null, user) : done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }
);