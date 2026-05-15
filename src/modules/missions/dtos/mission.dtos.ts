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
