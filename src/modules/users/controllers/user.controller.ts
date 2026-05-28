// import { Request, Response, NextFunction } from "express";
// import { StatusCodes } from "http-status-codes";
import { Body, Controller, Post, Route, Tags } from "tsoa"; // ❇️ 7주차 tsoa

import { UserSignUpRequest, UserSignUpResponse } from "../dtos/user.dto.js";
import { userSignUp } from "../services/user.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";


// 사용자 회원가입
// 🔗 API: POST /api/v1/users/signup
// 📝 body: { email, name, gender, birth, address, detailAddress, phoneNumber, password }

// ✅ 7주차 tsoa 방식 
// Controller, Route, Tags, Body 데코레이터 사용
@Route("users") // index.ts에서 /api/v1 prefix가 이미 붙으므로 여기선 users만
@Tags("User") // Swagger UI에서 사용할 태그 설정
export class UserController extends Controller {
    @Post("signup") // HTTP POST 메서드와 URL 경로 설정
    public async handleUserSignUp(
        @Body() requestBody: UserSignUpRequest // 요청 본문을 UserSignUpRequest 타입으로 받음
    ): Promise<ApiResponse<UserSignUpResponse>> { // 반환 타입 정의
        console.log("회원가입을 요청했습니다!");
        console.log("body:", requestBody); // 값이 잘 들어오나 확인하기 위한 테스트용

        const user = await userSignUp(requestBody); // Service 호출
        return success(user); // 성공 응답 반환
    }
}   

/* ☑️ 이전 방식 - Express
export const handleUserSignUp = async (req: Request, res: Response, next: NextFunction ) => {
    // 1단계: 클라이언트 요청 받음
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body); // 값이 잘 들어오나 확인하기 위한 테스트용
 
    // 2단계: Service 호출 (비즈니스 로직 위임)
    const user = await userSignUp(bodyToUser(req.body as UserSignUpRequest)); // 📀 req.body를 UserSignUpRequest 타입으로 '강제' (Type Assertion)
    
    
    // 3단계: 성공 응답 보내기
    res.status(StatusCodes.OK).json({ result: user });
};
*/