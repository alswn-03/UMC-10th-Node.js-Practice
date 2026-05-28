//-- 1-3. 가게에 미션 추가하기
export interface AddMissionRequest {
  /** 미션을 등록할 가게 ID */
  storeId: number;
  /** 미션 완료 시 지급할 포인트 */
  reward: number;
  /** 미션 마감일 (예: "2025-12-31") */
  deadline: string;
  /** 미션 내용 설명 */
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

/**
 * 미션 추가 성공 응답.
 * createMission 서비스가 실제로 반환하는 객체 구조를 타입으로 명시한 것.
 * tsoa @Response 데코레이터에서 제네릭으로 전달해야 Swagger에 응답 필드가 문서화된다.
 */
export interface AddMissionResponse {
  /** 생성된 미션 ID */
  missionId: number;
  /** 미션이 등록된 가게 ID */
  storeId: number;
  /** 미션 완료 시 지급할 포인트 */
  reward: number;
  /** 미션 마감일 */
  deadline: Date;
  /** 미션 내용 설명 */
  missionSpec: string;
}

// -- 1-4. 가게의 미션을 '도전 중인 미션'에 추가하기
export interface ChallengeMissionRequest {
  /** 도전하는 유저 ID */
  userId: number;
  /** 도전할 미션 ID */
  missionId: number;
}
export const bodyToChallengeMission = (body: ChallengeMissionRequest) => {
  return {
    userId: body.userId,
    missionId: body.missionId,
  };
};

/**
 * 미션 도전 성공 응답.
 * challengeMission 서비스가 실제로 반환하는 객체 구조를 타입으로 명시한 것.
 */
export interface ChallengeMissionResponse {
  /** 생성된 유저-미션 관계 ID */
  userMissionId: number;
  /** 도전하는 유저 ID */
  userId: number;
  /** 도전한 미션 ID */
  missionId: number;
  /** 미션 진행 상태 (예: "진행중") */
  status: string;
}


//-- 2. 미션 목록 조회 (cursor 방식)
export interface MissionStore {
  /** 가게 ID */
  id: number;
  /** 가게 이름 */
  name: string | null;
}
export interface UserInfo {
  /** 유저 ID */
  id: number;
  /** 유저 이름 */
  name: string;
}
export interface MissionItem {
  /** 미션 ID */
  id: number;
  /** 미션 내용 설명 */
  missionSpec: string;
  /** 미션 완료 시 지급할 포인트 */
  reward: number;
  /** 미션 마감일 */
  deadline: Date;
}

/** 특정 가게 기준 미션 목록 조회 응답 */
export interface MissionListByStoreResponse {
  /** 조회된 가게 정보 */
  store: MissionStore;
  /** 해당 가게의 미션 목록 */
  missions: MissionItem[];
  /** 페이지네이션 커서 (다음 페이지 없으면 null) */
  pagination: { cursor: number | null };
}
export const responseFromMissionListByStore = (
  storeWithMissions: any
): MissionListByStoreResponse => {
  const lastMission = storeWithMissions.mission[storeWithMissions.mission.length - 1];

  return {
    store: {
      id: Number(storeWithMissions.id),
      name: storeWithMissions.name,
    },
    missions: storeWithMissions.mission.map((m: any) => ({
      id: Number(m.id),
      missionSpec: m.missionSpec,
      reward: m.reward,
      deadline: m.deadline,
    })),
    pagination: {
      cursor: lastMission == 5 ? Number(lastMission.id) : null,
    },
  };
};

/** 사용자 기준 도전 중인 미션 목록 조회 응답 */
export interface MissionListByUserResponse {
  /** 조회된 유저 정보 */
  user: UserInfo;
  /** 도전 중인 미션 목록 */
  missions: MissionItem[];
  /** 미션과 1:1 매칭되는 가게 정보 목록 */
  stores: MissionStore[];
  /** 페이지네이션 커서 (다음 페이지 없으면 null) */
  pagination: { cursor: number | null };
}
export const responseFromMissionListByUser = (
  userWithMissions: any
): MissionListByUserResponse => {
  const lastMission = userWithMissions.mission[userWithMissions.mission.length - 1];

  return {
    user: {
      id: Number(userWithMissions.id),
      name: userWithMissions.name,
    },
    missions: userWithMissions.mission.map((m: any) => ({
      id: Number(m.id),
      missionSpec: m.missionSpec,
      reward: m.reward,
      deadline: m.deadline,
    })),
    stores: userWithMissions.mission.map((m: any) => ({
      id: Number(m.store.id),
      name: m.store.name,
    })),
    pagination: {
      cursor: lastMission == 5 ? Number(lastMission.id) : null,
    },
  };
};
