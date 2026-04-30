import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

import {bodyToReview, bodyToMission, bodyToChallengeMission} from "../dtos/store.dtos.js";
import {createReview, createMission, challengeMission} from "../services/store.service.js";

// ✅ 1-2. 리뷰 작성하기
export const handleAddReview = async (req: Request, res: Response) => {
    try {
        console.log("리뷰 add 요청:", req.body);

        const review = await createReview(bodyToReview(req.body));
        res.status(StatusCodes.OK).json({
            result: review,
        });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: (err as Error).message,
        });
    }
};

// ✅ 1-3 미션 추가하기
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
