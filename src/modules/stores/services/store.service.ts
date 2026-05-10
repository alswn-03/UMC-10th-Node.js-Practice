import { 
  getStoreById, 
  getAllStoreReviews,
  addReview, 
  addMission,
  getMissionById,
  checkUserMissionExists,
  addUserMission,
} from "../repositories/store.repository.js";

import {
  ReviewListResponse,
  responseFromReviews,
} from "../dtos/store.dtos.js";


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


// ✅ 1-3 미션 추가하기
export const createMission = async (data: any) => {
  const store = await getStoreById(data.storeId);

  if (!store) {
    throw new Error("존재하지 않는 가게입니다.");
  }

  const missionId = await addMission(
    data.storeId,
    data.reward,
    data.deadline,
    data.missionSpec
  );

  return {
    missionId,
    storeId: data.storeId,
    reward: data.reward,
    deadline: data.deadline,
    missionSpec: data.missionSpec,
  };
};


// ✅ 1-4. 가게의 미션을 '도전 중인 미션'에 추가하기
export const challengeMission = async (data: any) => {
  const userId = 1; // 현재는 DB에 있는 첫 번째 유저가 요청했다고 가정

  const mission = await getMissionById(data.missionId);

  if (!mission) {
    throw new Error("존재하지 않는 미션입니다.");
  }

  const isAlreadyChallenging = await checkUserMissionExists(
    userId,
    data.missionId
  );

  if (isAlreadyChallenging) {
    throw new Error("이미 도전 중인 미션입니다.");
  }

  const userMissionId = await addUserMission(userId, data.missionId);

  return {
    userMissionId,
    userId,
    missionId: data.missionId,
    status: "진행중",
  };
};
