//-- 1. 가게에 미션 추가하기
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
  userId: number;
  missionId: number;
}
export const bodyToChallengeMission = (body: ChallengeMissionRequest) => {
  return {
    userId: body.userId,
    missionId: body.missionId,
  };
};


//-- 2. 미션 목록 조회 (cursor 방식)
export interface MissionStore { // mission과 연관된 가게 정보
    id: number;
    name: string | null;
}
export interface UserInfo { // 사용자 정보
    id: number;
    name: string;
}
export interface MissionItem { // 미션 목록의 각 아이템 정보
    id: number;
    missionSpec: string;
    reward: number;
    deadline: Date;
}

export interface MissionListByStoreResponse { // ✅ 특정 가게 기준 미션 목록 조회 응답
    store: MissionStore;  // 1개의 가게 정보
    missions: MissionItem[];  // 해당 가게의 미션 list
    pagination: {cursor: number | null;};
}
export const responseFromMissionListByStore = (
    storeWithMissions: any
): MissionListByStoreResponse => {

  const lastMission = storeWithMissions.mission[storeWithMissions.mission.length - 1];

  return {
    store: {
      id: Number(storeWithMissions.id), // BigInt -> Number
      name: storeWithMissions.name,
    },
    missions: storeWithMissions.mission.map((m: any) => ({
      id: Number(m.id), // BigInt -> Number
      missionSpec: m.missionSpec,
      reward: m.reward,
      deadline: m.deadline,
    })),
    pagination: {
      cursor: lastMission == 5 ? Number(lastMission.id) : null  // cursor는 마지막 아이템의 id값, 더 이상 아이템이 없으면 null
    },
  };
};

export interface MissionListByUserResponse { // 사용자 기준 미션 목록 조회 응답
    user: UserInfo;  // 나의 정보 (id, name)
    missions: MissionItem[];  // 미션 list
    stores: MissionStore[];   // 미션과 연관된 가게 정보 list (미션과 1:1 매칭)
    pagination: {cursor: number | null;};
}
export const responseFromMissionListByUser = ( // ✅ 사용자 기준 미션 목록 조회 응답 형식으로 변환하는 함수
    userWithMissions: any
): MissionListByUserResponse => {

  const lastMission = userWithMissions.mission[userWithMissions.mission.length - 1];

  return {
    user: {
      id: Number(userWithMissions.id), // BigInt -> Number
      name: userWithMissions.name,
    },
    missions: userWithMissions.mission.map((m: any) => ({
      id: Number(m.id), // BigInt -> Number
      missionSpec: m.missionSpec,
      reward: m.reward,
      deadline: m.deadline,
    })),
    stores: userWithMissions.mission.map((m: any) => ({
      id: Number(m.store.id), // BigInt -> Number
      name: m.store.name,
    })),
    pagination: {
      cursor: lastMission == 5 ? Number(lastMission.id) : null  // cursor는 마지막 아이템의 id값, 더 이상 아이템이 없으면 null
    },
  };
};          
