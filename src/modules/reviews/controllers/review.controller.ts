import { Body, Controller, Get, Path, Post, Query, Request, Response, Route, Tags } from "tsoa";
import type { Request as ExpressRequest } from "express";

import {
  AddReviewRequest,
  AddReviewResponse,
  ReviewListResponse,
  bodyToReview,
} from "../dtos/review.dtos.js";
import { listStoreReviews, listMyReviews, createReview } from "../services/review.service.js";
import { ApiResponse, ErrorResponse, success } from "../../../common/responses/response.js";


@Route("stores")
@Tags("Review")
export class StoreReviewController extends Controller {
  /**
   * 특정 가게의 리뷰 목록을 cursor 기반 페이지네이션으로 조회합니다.
   * @summary 가게 리뷰 목록 조회
   */
  @Get("{storeId}/reviews")
  @Response<ErrorResponse>(400, "존재하지 않는 가게")
  public async handleListStoreReviews(
    @Path() storeId: number,
    @Query() cursor?: number
  ): Promise<ReviewListResponse> {
    return listStoreReviews(storeId, cursor ?? 0);
  }

  /**
   * 특정 가게에 리뷰를 작성합니다. (로그인 필요)
   * @summary 리뷰 작성
   */
  @Post("reviews")
  @Response<ErrorResponse>(401, "인증 실패")
  @Response<ErrorResponse>(400, "존재하지 않는 가게")
  public async handleAddReview(
    @Request() request: ExpressRequest,
    @Body() requestBody: AddReviewRequest
  ): Promise<ApiResponse<AddReviewResponse>> {
    // isLogin 미들웨어가 req.user에 Prisma User 객체를 담아준다
    const userId = Number((request.user as { id: bigint }).id);
    const review = await createReview(bodyToReview(requestBody), userId);
    return success({ ...review, reviewId: Number(review.reviewId) });
  }
}


@Route("me")
@Tags("Review")
export class MeReviewController extends Controller {
  /**
   * 내가 작성한 리뷰 목록을 cursor 기반 페이지네이션으로 조회합니다. (로그인 필요)
   * @summary 내 리뷰 목록 조회
   */
  @Get("reviews")
  @Response<ErrorResponse>(401, "인증 실패")
  public async handleListMyReviews(
    @Request() request: ExpressRequest,
    @Query() cursor?: number
  ): Promise<ReviewListResponse> {
    const userId = Number((request.user as { id: bigint }).id);
    return listMyReviews(userId, cursor ?? 0);
  }
}
