// import { pool } from "../../../db.config.js";
// import { ResultSetHeader, RowDataPacket } from "mysql2";

import { prisma } from "../../../db.config.js";


// ✅ 1-3. 가게에 미션 추가하기
export const addMission = async (
  storeId: number,
  reward: number,
  deadline: Date,
  missionSpec: string
) => {
  // const conn = await pool.getConnection();

  try{ 
    const createdMission = await prisma.mission.create({
      data: {
        storeId: BigInt(storeId),
        reward: reward,
        deadline: deadline,
        missionSpec: missionSpec,
      },
    });
    return createdMission.id;
  } catch (err) {
    throw new Error(`미션을 추가하는 중 오류가 발생했어요: ${err}`);
  }
};

  // try {
  //   const [result] = await conn.query<ResultSetHeader>(
  //     `INSERT INTO mission (store_id, reward, deadline, mission_spec)
  //      VALUES (?, ?, ?, ?)`,
  //     [storeId, reward, deadline, missionSpec]
  //   );

  //   return result.insertId;
  // } finally {
  //   conn.release();
  // }



// ✅ 1-4. 가게의 미션을 '도전 중인 미션'에 추가하기

// (1) mission 테이블에서 해당 미션이 실제로 있는지
export const getMissionById = async (missionId: number) => {

  try {
    const existingMission = await prisma.mission.findUnique({
      where: {
        id: BigInt(missionId),
      }
    });

    return existingMission ?? null;
  } catch (err) {
    throw new Error(`미션을 찾는 중 오류가 발생했어요: ${err}`);
  }
};
  // const conn = await pool.getConnection();

  // try {
  //   const [mission] = await conn.query<RowDataPacket[]>(
  //     `SELECT * FROM mission WHERE id = ?`,
  //     [missionId]
  //   );

  //   return mission[0] || null;
  // } finally {
  //   conn.release();
  // }


// (2) 그다음 user_mission 테이블에서 이 사용자가 이미 이 미션에 도전 중인지
export const checkUserMissionExists = async (
  userId: number,
  missionId: number
): Promise<boolean> => {
  const userMission = await prisma.userMission.findFirst({
    where: {
      userId: userId,
      missionId: missionId,
    },
  });

  return Boolean(userMission); // 📌 조회 결과가 있으면 true, 없으면 false
};
// const conn = await pool.getConnection();

// try {
//   const [result] = await conn.query<RowDataPacket[]>(
//     `SELECT EXISTS(
//       SELECT 1
//       FROM user_mission
//       WHERE user_id = ? AND mission_id = ?
//     ) AS isExistMission;`,
//     [userId, missionId]
//   );

//   return Boolean(result[0]?.isExistMission);
// } finally {
//   conn.release();
// }


// (3) DB에 insert - user_mission 테이블에 '도전 중인 미션'으로 추가
export const addUserMission = async (
  userId: number,
  missionId: number
): Promise<number> => {
  const createdUserMission = await prisma.userMission.create({
    data: {
      userId: userId,
      missionId: missionId,
      status: "진행중",
    },
  });

  // 생성된 user_mission 데이터의 id 반환
  // 기존 SQL의 result.insertId 역할
  return Number(createdUserMission.id); // 해야해? 말아야해?
};

// const conn = await pool.getConnection();

// try {
//   const [result] = await conn.query<ResultSetHeader>(
//     `INSERT INTO user_mission (user_id, mission_id, status)
//      VALUES (?, ?, ?);`,
//     [userId, missionId, "진행중"]
//   );

//   return result.insertId;
// } finally {
//   conn.release();
// }





// ✅ 2-1 특정 가게의 미션 목록 조회하기 - MissionListByStoreResponse 타입으로 반환
export const getMissionsByStore = async (
  storeId: number,
  cursor: number
) => {
  const storeWithMissions = await prisma.store.findMany({
    //ORM
    select: {
      //store
      id: true,
      name: true,
      // mission과 relation(관계)을 맺고 있는 - store 테이블 데이터도 함께 조회 
      mission: {
        select: {
          id: true,
          missionSpec: true,
          reward: true,
          deadline: true,
        },
        where: { id: { gt: BigInt(cursor) } },
        orderBy: { id: "asc" },
        take: 5,
      },
    },
    where: { id: BigInt(storeId) },
  });

  return storeWithMissions;
}



// ✅ 2-2 내가 도전 중인 미션 목록 조회하기 - MissionListByUserResponse 타입으로 반환
export const getMissionsByUser = async (
  userId: number,
  cursor: number
) => {
  const userWithMissions = await prisma.user.findMany({
    //ORM
    select: {
      //user
      id: true,
      name: true,
      
      // mission과 relation(관계)을 맺고 있는 - user 테이블 데이터도 함께 조회 
      mission: {
        select: {
          id: true,
          missionSpec: true,
          reward: true,
          deadline: true,
        },
        
        where: { id: { gt: BigInt(cursor) } },
        orderBy: { id: "asc" },
        take: 5,
      },

      // 해당 mission에 대한 가게 정보
      store:{
        select: {
          id: true,
          name: true,
        }
      }
    },
    where: { id: BigInt(userId) },
  });

  return userWithMissions;
}
