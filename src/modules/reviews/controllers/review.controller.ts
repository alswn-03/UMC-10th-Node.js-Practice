import { Body, Controller, Get, Path, Post, Query, Response, Route, Tags } from "tsoa";

import {
  AddReviewRequest,
  AddReviewResponse,
  ReviewListResponse,
  bodyToReview,
} from "../dtos/review.dtos.js";
import { listStoreReviews, listMyReviews, createReview } from "../services/review.service.js";
import { ApiResponse, ErrorResponse, success } from "../../../common/responses/response.js";


// ✅ 1-1 특정 가게의 리뷰 목록 조회 & 2. 리뷰 작성하기
// /stores 경로를 공유하는 리뷰 관련 엔드포인트를 하나의 컨트롤러로 묶음
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
   * 특정 가게에 리뷰를 작성합니다.
   * @summary 리뷰 작성
   */
  @Post("reviews")
  @Response<ErrorResponse>(400, "존재하지 않는 가게")
  public async handleAddReview(
    @Body() requestBody: AddReviewRequest
  ): Promise<ApiResponse<AddReviewResponse>> {
    const review = await createReview(bodyToReview(requestBody));
    return success({ ...review, reviewId: Number(review.reviewId) });
  }
}


// ✅ 1-2 내가 작성한 리뷰 목록 조회하기
@Route("me")
@Tags("Review")
export class MeReviewController extends Controller {
  /**
   * 내가 작성한 리뷰 목록을 cursor 기반 페이지네이션으로 조회합니다.
   * @summary 내 리뷰 목록 조회
   */
  @Get("reviews")
  @Response<ErrorResponse>(400, "존재하지 않는 사용자")
  public async handleListMyReviews(
    @Query() userId: number,
    @Query() cursor?: number
  ): Promise<ReviewListResponse> {
    return listMyReviews(userId, cursor ?? 0);
  }
}
