// -- 1-1. 리뷰 목록(list) 조회하기 (cursor 방식)
export interface ReviewStore {
    id: number;
    name: string | null;
    address: string | null;
    regionId: number;
}

export interface ReviewUser {
    id: number;
    name: string;
    email: string;
}

export interface ReviewItem {
    id: number;
    body: string;
    score: number;
    store: ReviewStore | null;
    user: ReviewUser | null;
};
export interface ReviewListResponse {
    data: ReviewItem[];
    pagination: {cursor: number | null;};
};
export const responseFromReviews = (
    reviews: ReviewItem[]
): ReviewListResponse => {
    const lastReview = reviews[reviews.length - 1];
  
    return {
        data: reviews,
        pagination: {cursor: lastReview ? lastReview.id : null},
    };
};


// -- 1-2. 가게에 리뷰 작성하기
// review 작성, 요청 타입
export interface AddReviewRequest {
    storeId: number;
    body: string;
    score: number;
}
// review 작성, 요청 -> 내부 데이터 변환
export const bodyToReview = (body: AddReviewRequest) => {
    return {
        storeId: body.storeId,
        body: body.body,
        score: body.score,
    }
}
