import { Body, Controller, Patch, Post, Request, Response, Route, Tags } from "tsoa";
import type { Request as ExpressRequest } from "express";

import {
  UserSignUpRequest,
  UserSignUpResponse,
  UserUpdateRequest,
  UserUpdateResponse,
} from "../dtos/user.dto.js";
import { userSignUp, updateUserProfile } from "../services/user.service.js";
import { ApiResponse, ErrorResponse, success } from "../../../common/responses/response.js";


@Route("users")
@Tags("User")
export class UserController extends Controller {
  /**
   * 이메일, 비밀번호, 선호 카테고리 등을 입력받아 회원가입을 처리합니다.
   * @summary 회원가입
   */
  @Post("signup")
  @Response<ErrorResponse>(409, "이미 존재하는 이메일")
  public async handleUserSignUp(
    @Body() requestBody: UserSignUpRequest
  ): Promise<ApiResponse<UserSignUpResponse>> {
    const user = await userSignUp(requestBody);
    return success(user);
  }

  /**
   * 로그인한 사용자의 프로필 정보를 수정합니다.
   * Google 로그인으로 가입한 경우 비어있는 생일, 전화번호 등을 채울 때 사용합니다.
   * @summary 내 프로필 수정
   */
  @Patch("me")
  @Response<ErrorResponse>(401, "인증 실패")
  public async handleUpdateUserProfile(
    @Request() request: ExpressRequest,
    @Body() requestBody: UserUpdateRequest
  ): Promise<ApiResponse<UserUpdateResponse>> {
    // isLogin 미들웨어를 통과하면 jwtStrategy가 req.user에 Prisma User 객체를 담아준다
    const userId = Number((request.user as { id: bigint }).id);
    const updated = await updateUserProfile(userId, requestBody);
    return success(updated);
  }
}
