import { 
  MissionListByStoreResponse,
  MissionListByUserResponse,
  responseFromMissionListByStore,
  responseFromMissionListByUser,
} from "../dtos/mission.dtos.js";
import { 
  addMission,
  getMissionById,
  checkUserMissionExists,
  addUserMission,
  getMissionsByStore,
  getMissionsByUser,
} from "../repositories/mission.repository.js";


// ✅ 1-3 미션 추가하기
export const createMission = async (data: any) => {
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
  const userId = data.userId;

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

// ✅ 2-1 특정 가게의 미션 목록 조회하기
export const MissionsByStore = async (
  storeId: number, 
  cursor: number
): Promise<MissionListByStoreResponse> => {
    const storeWithMissions = await getMissionsByStore(storeId, cursor);

    if (!storeWithMissions[0]) {
      throw new Error("존재하지 않는 가게입니다.");
    }

    return responseFromMissionListByStore(storeWithMissions[0]);
};

// ✅ 2-2 내가 도전 중인 미션 목록 조회하기
export const MissionsByUser = async (
  userId: number,
  cursor: number
): Promise<MissionListByUserResponse> => {
  const userWithMissions = await getMissionsByUser(userId, cursor);

  if (!userWithMissions[0]) {
    throw new Error("존재하지 않는 사용자입니다.");
  }

  return responseFromMissionListByUser(userWithMissions);
};  