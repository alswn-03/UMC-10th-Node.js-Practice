import { 
  addMission,
  getMissionById,
  checkUserMissionExists,
  addUserMission,
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
