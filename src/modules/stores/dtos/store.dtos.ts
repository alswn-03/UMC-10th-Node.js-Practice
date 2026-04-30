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

//-- 1-3. 가게에 미션 추가하기
export interface AddMissionRequest {
    storeId: number;
    reward: number;
    deadline: string;
    missionSpec: string;
}
export const bodyToMission = (body: AddMissionRequest) => {
    return {
        storeId: body.storeId,
        reward: body.reward,
        deadline: new Date(body.deadline),
        missionSpec: body.missionSpec,
    };
};

// -- 1-4. 가게의 미션을 '도전 중인 미션'에 추가하기
export interface ChallengeMissionRequest {
  missionId: number;
}

export const bodyToChallengeMission = (body: ChallengeMissionRequest) => {
  return {
    missionId: body.missionId,
  };
};