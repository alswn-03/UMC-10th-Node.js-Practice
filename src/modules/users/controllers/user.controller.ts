import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { bodyToUser, UserSignUpRequest } from "../dtos/user.dto.js";
import { userSignUp } from "../services/user.service.js";


// ✅ 사용자 회원가입
// 🔗 API: POST /api/v1/users/signup
// 📝 body: { email, name, gender, birth, address, detailAddress, phoneNumber, password }
export const handleUserSignUp = async (req: Request, res: Response, next: NextFunction ) => {
    // ✅ 1단계: 클라이언트 요청 받음
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body); // 값이 잘 들어오나 확인하기 위한 테스트용
 
    // ✅ 2단계: Service 호출 (비즈니스 로직 위임)
    const user = await userSignUp(bodyToUser(req.body as UserSignUpRequest)); // 📀 req.body를 UserSignUpRequest 타입으로 '강제' (Type Assertion)
    
    
    // ✅ 3단계: 성공 응답 보내기
    res.status(StatusCodes.OK).json({ result: user });
};