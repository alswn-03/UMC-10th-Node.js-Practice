import { pool } from "../../../db.config.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import { prisma } from "../../../db.config.js";


// ✅ 1-1. 특정 가게의 리뷰 목록(list) 조회하기 (cursor 방식)
export const getAllStoreReviews = async (
  storeId: number,
  cursor: number
) => {
  const reviews = await prisma.review.findMany({
    //ORM
    select: {
      id: true,
      body: true,
      score: true,

      // review와 relation(관계)을 맺고 있는 - store 테이블 데이터도 함께 조회
      store: {
        select: {
          id: true,
          name: true,
          regionId: true,
          address: true,
        },
      },
      // review와 relation(관계)을 맺고 있는 - user 테이블 데이터도 함께 조회
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    where: { 
      storeId: BigInt(storeId), // Prisma의 BigInt 타입과 맞추기 위해 BigInt로 변환

      // cursor 기반 페이지네이션
      id: {
        gt: BigInt(cursor),// cursor 값보다 id가 큰 리뷰만 조회
      },
    },

    orderBy: { id: "asc" }, // id 기준 오름차순 정렬

    take: 5,     // limit 5 - take 옵션을 이용해 한 번에 가져올 리뷰 수를 제한
  });

  // Prisma는 BigInt 타입을 반환하는데
  // JSON 응답에서는 BigInt를 사용할 수 없으므로
  // Number 타입으로 변환
  return reviews.map((review) => ({
    id: Number(review.id),
    body: review.body,
    score: review.score,
    store: review.store ? {
      id: Number(review.store.id),
      name: review.store.name,
      address: review.store.address,
      regionId: Number(review.store.regionId),
    } : null,
    user: review.user ? {
      id: Number(review.user.id),
      name: review.user.name,
      email: review.user.email,
    } : null,
  }));
};


// ✅ 1-2. 가게에 리뷰 작성하기
// 1. store 존재 확인
export const getStoreById = async (storeId: number) => {
  const conn = await pool.getConnection();

  try {
    const [store] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM store WHERE id = ?`,
      [storeId]
    );

    return store[0] || null;
  } finally {
    conn.release();
  }
};

// 2. 리뷰 추가
export const addReview = async (
  userId: number,
  storeId: number,
  body: string,
  score: number
) => {
  const conn = await pool.getConnection();

  try {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO review (user_id, store_id, body, score)
      VALUES (?, ?, ?, ?)`,
      [userId, storeId, body, score]
    );

    return result.insertId;
  } finally {
    conn.release();
  }
};
