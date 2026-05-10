import { pool } from "../../../db.config.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import { prisma } from "../../../db.config.js"; // 1-1


// ✅ 1-1. 특정 가게의 리뷰 목록(list) 조회하기 (cursor 방식)
// ✅ 1-1. 특정 가게의 리뷰 목록(list) 조회하기 (cursor 방식)
export const getAllStoreReviews = async ( // 📌 service 에서 호출된다
  storeId: number,
  cursor: number
) => {
  const reviews = await prisma.review.findMany({
    //ORM
    select: {
      // id: true 뜻 -> prisma 문법으로, review 테이블에서 id 필드(컬럼)만 선택해서 가져오겠다
      id: true,
      body: true,
      score: true,
      storeId: true,
      userId: true,

      // review와 relation(관계)을 맺고 있는
      // store 테이블 데이터도 함께 조회
      store: true,

      // review와 relation(관계)을 맺고 있는
      // user 테이블 데이터도 함께 조회
      user: true,
    },

    where: { 
      storeId: BigInt(storeId), // Prisma의 BigInt 타입과 맞추기 위해 BigInt로 변환

      // cursor 기반 페이지네이션
      // cursor 값보다 id가 큰 리뷰만 조회
      id: {
        gt: BigInt(cursor),
      },
    },

    // id 기준 오름차순 정렬
    orderBy: { id: "asc" },

    // limit 5
    // take 옵션을 이용해 한 번에 가져올 리뷰 수를 제한
    take: 5,
  });

  // Prisma는 BigInt 타입을 반환하는데
  // JSON 응답에서는 BigInt를 사용할 수 없으므로
  // Number 타입으로 변환
  return reviews.map((review) => ({
    ...review,

    // bigint → number 변환
    id: Number(review.id),
    storeId: Number(review.storeId),
    store: review.store ? {
      ...review.store,
      id: Number(review.store.id),
      regionId: Number(review.store.regionId),
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


// ✅ 1-3. 가게에 미션 추가하기
export const addMission = async (
  storeId: number,
  reward: number,
  deadline: Date,
  missionSpec: string
) => {
  const conn = await pool.getConnection();

  try {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO mission (store_id, reward, deadline, mission_spec)
       VALUES (?, ?, ?, ?)`,
      [storeId, reward, deadline, missionSpec]
    );

    return result.insertId;
  } finally {
    conn.release();
  }
};

// ✅ 1-4. 가게의 미션을 '도전 중인 미션'에 추가하기
export const getMissionById = async (missionId: number) => {
  const conn = await pool.getConnection();

  try {
    const [mission] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM mission WHERE id = ?`,
      [missionId]
    );

    return mission[0] || null;
  } finally {
    conn.release();
  }
};

export const checkUserMissionExists = async (
  userId: number,
  missionId: number
): Promise<boolean> => {
  const conn = await pool.getConnection();

  try {
    const [result] = await conn.query<RowDataPacket[]>(
      `SELECT EXISTS(
        SELECT 1
        FROM user_mission
        WHERE user_id = ? AND mission_id = ?
      ) AS isExistMission;`,
      [userId, missionId]
    );

    return Boolean(result[0]?.isExistMission);
  } finally {
    conn.release();
  }
};

export const addUserMission = async (
  userId: number,
  missionId: number
): Promise<number> => {
  const conn = await pool.getConnection();

  try {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO user_mission (user_id, mission_id, status)
       VALUES (?, ?, ?);`,
      [userId, missionId, "진행중"]
    );

    return result.insertId;
  } finally {
    conn.release();
  }
};