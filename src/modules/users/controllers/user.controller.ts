import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { bodyToUser, UserSignUpRequest } from "../dtos/user.dto.js";
import { userSignUp } from "../services/user.service.js";


/* 로그인 기능
req를 받아서 bodyToUser로 변환시키고 
-> userSignup 서비스를 호출 해서 
-> 결과를 res.status(...).json(...)으로 클라이언트에 보내기 */
export const handleUserSignUp = async (req: Request, res: Response, next: NextFunction ) => {
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body); // 값이 잘 들어오나 확인하기 위한 테스트용
 
    //서비스 로직 호출 
    const user = await userSignUp(bodyToUser(req.body as UserSignUpRequest)); // req.body를 UserSignUpRequest 타입으로 '강제' (Type Assertion)
    
    
    //성공 응답 보내기
    res.status(StatusCodes.OK).json({ result: user });
};