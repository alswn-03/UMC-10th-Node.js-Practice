import {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

import {responseFromReviews, bodyToReview, bodyToMission, bodyToChallengeMission} from "../dtos/store.dtos.js";
import {listStoreReviews, createReview, createMission, challengeMission} from "../services/store.service.js";

// ✅ 1-1. 특정 가게의 리뷰 목록(list) 조회하기 (cursor 방식)
// app.get("/api/v1/stores/:storeId/reviews", handleListStoreReviews);
export const handleListStoreReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => { // 리턴값 없다 (void)
  try {
    const storeId = parseInt(req.params.storeId as string, 10);
    
    const cursor = 
      typeof req.query.cursor === "string"
        ? parseInt(req.query.cursor, 10)
        : 0// cursor가 없으면 0으로 간주

    /* 이 코드와 같은 뜻
    let cursor;
    if (typeof req.query.cursor === "string") {
      cursor = parseInt(req.query.cursor, 10);
    } else {
      cursor = 0;
    } 
    */
   
    const reviews = await listStoreReviews(storeId, cursor) // 📌Service에서 리뷰 목록을 가져옴
    res.status(StatusCodes.OK).json(reviews);

  } catch (err) {
    next(err);
  }
};


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
