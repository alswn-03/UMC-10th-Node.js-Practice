import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

import {bodyToMission, bodyToChallengeMission} from "../dtos/mission.dtos.js";
import {createMission, challengeMission, MissionsByStore} from "../services/mission.service.js";

// ✅ 1-3 미션 추가하기
// 🔗 API: POST /api/v1/stores/missions
// 📝 body: { storeId: number, reward: number, deadline: string, missionSpec: string }
export const handleAddMission = async (req: Request, res: Response) => {
  try {
    console.log("미션 추가 요청:", req.body);

    const mission = await createMission(bodyToMission(req.body));

    res.status(StatusCodes.OK).json({
      result: mission,
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: (err as Error).message,
    });
  }
};

// ✅ 1-4 가게의 미션을 '도전 중인 미션'에 추가하기
// 🔗 API: POST /api/v1/missions/challenge
// 📝 body: { userId: number, missionId: number }
export const handleChallengeMission = async (req: Request, res: Response) => {
  try {
    console.log("미션 도전 요청:", req.body);

    const result = await challengeMission(bodyToChallengeMission(req.body));
    res.status(StatusCodes.OK).json({
      result,
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: (err as Error).message,
    });
  }
};


// ✅ 2-1 특정 가게의 미션 목록 조회하기
// 🔗 API: GET /api/v1/stores/:storeId/missions?cursor=0
export const handleGetMissionsByStore = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("가게의 미션 목록 조회 요청:", req.params);

    const storeId = parseInt(req.params.storeId as string, 10);
    const cursor = 
      typeof req.query.cursor === "string"
      ? parseInt(req.query.cursor, 10)
      : 0;

    const missions = await MissionsByStore(storeId, cursor);
    res.status(StatusCodes.OK).json(missions);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: (err as Error).message,
    });
  }
};

// ✅ 2-2 내가 도전 중인 미션 목록 조회하기
// 🔗 API: GET /api/v1/me/missions?cursor=0
export const handleGetMissionByUser = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("내가 도전 중인 미션 목록 조회 요청:", req.params);

    const userId = parseInt(req.params.userId as string, 10);
    const cursor = 
      typeof req.query.cursor === "string"
      ? parseInt(req.query.cursor, 10)
      : 0;

    // const missions = await MissionsByUser(userId, cursor);
    // res.status(StatusCodes.OK).json(missions);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: (err as Error).message,
    });
  }
};