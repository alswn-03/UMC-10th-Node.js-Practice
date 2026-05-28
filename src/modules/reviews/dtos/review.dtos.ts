// -- 1. 리뷰 목록(list) 조회하기 (cursor 방식)
export interface ReviewStore {
  /** 가게 ID */
  id: number;
  /** 가게 이름 */
  name: string | null;
  /** 가게 주소 */
  address: string | null;
  /** 지역 ID */
  regionId: number;
}

export interface ReviewUser {
  /** 유저 ID */
  id: number;
  /** 유저 이름 */
  name: string;
  /** 유저 이메일 */
  email: string;
}

export interface ReviewItem {
  /** 리뷰 ID */
  id: number;
  /** 리뷰 본문 */
  body: string;
  /** 별점 (1~5) */
  score: number;
  /** 리뷰가 달린 가게 정보 */
  store: ReviewStore | null;
  /** 리뷰를 작성한 유저 정보 */
  user: ReviewUser | null;
}

/** 리뷰 목록 조회 응답 */
export interface ReviewListResponse {
  /** 리뷰 목록 */
  data: ReviewItem[];
  /** 페이지네이션 커서 (다음 페이지 없으면 null) */
  pagination: { cursor: number | null };
}
export const responseFromReviews = (
  reviews: ReviewItem[]
): ReviewListResponse => {
  const lastReview = reviews[reviews.length - 1];

  return {
    data: reviews,
    pagination: { cursor: lastReview ? lastReview.id : null },
  };
};


// -- 2. 가게에 리뷰 작성하기
export interface AddReviewRequest {
  /** 리뷰를 작성할 가게 ID */
  storeId: number;
  /** 리뷰 본문 */
  body: string;
  /** 별점 (1~5) */
  score: number;
}
export const bodyToReview = (body: AddReviewRequest) => {
  return {
    storeId: body.storeId,
    body: body.body,
    score: body.score,
  };
};

/**
 * 리뷰 작성 성공 응답.
 * createReview 서비스가 실제로 반환하는 객체 구조를 타입으로 명시한 것.
 */
export interface AddReviewResponse {
  /** 생성된 리뷰 ID */
  reviewId: number;
  /** 리뷰가 등록된 가게 ID */
  storeId: number;
}
