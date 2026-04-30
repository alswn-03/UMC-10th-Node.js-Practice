import { pool } from "../../../db.config.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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