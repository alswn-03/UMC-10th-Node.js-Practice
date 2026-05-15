import {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

import {responseFromReviews, bodyToReview} from "../dtos/review.dtos.js";
import {listStoreReviews, createReview} from "../services/review.service.js";

// ✅ 1-1. 특정 가게의 리뷰 목록(list) 조회하기 (cursor 방식)
// 🔗 API: GET /api/v1/stores/:storeId/reviews
// 📝 예시: GET /api/v1/stores/1/reviews?cursor=0
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

    const reviews = await listStoreReviews(storeId, cursor) // 📌Service에서 리뷰 목록을 가져옴
    res.status(StatusCodes.OK).json(reviews);

  } catch (err) {
    next(err);
  }
};


// ✅ 1-2. 리뷰 작성하기
// 🔗 API: POST /api/v1/stores/reviews
// 📝 body: { storeId: number, body: string, score: number }
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
