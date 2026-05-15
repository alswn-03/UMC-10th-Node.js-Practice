import { 
  getStoreById, 
  getAllStoreReviews,
  addReview, 
} from "../repositories/review.repository.js";

import {
  ReviewListResponse,
  responseFromReviews,
} from "../dtos/review.dtos.js";


// ✅ 1-1. 특정 가게의 리뷰 목록(list) 조회하기 (cursor 방식)
// listStoreReviews Service에서는 
// 단순히 Repository를 호출하고, 
// 이를 DTO로 변환해 반환하는 로직을 구현
export const listStoreReviews = async ( // 📌 controller에서 호출 되는 함수
  storeId: number,
  cursor: number
): Promise<ReviewListResponse> => { // DTO ReviewListResponse 인터페이스
  const reviews = await getAllStoreReviews(storeId, cursor); // 📌 Repository에서 리뷰 목록을 가져옴
  return responseFromReviews(reviews); // Repository에서 가져온 리뷰 데이터를 DTO로 변환하여 반환
};



 // ✅ 1-2. 리뷰 작성하기
export const createReview = async (data: any) => {
  const userId = 1; // 과제 조건: 특정 사용자

  // 1. 가게 존재 확인
  const store = await getStoreById(data.storeId);

  if (!store) {
    throw new Error("존재하지 않는 가게입니다.");
  }

  // 2. 리뷰 추가
  const reviewId = await addReview(
    userId,
    data.storeId,
    data.body,
    data.score
  );

  return {
    reviewId,
    storeId: data.storeId,
  };
};
