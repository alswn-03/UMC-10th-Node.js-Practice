/*DB 직접 접근 - SQL*/
import { prisma } from "../../../db.config.js";

// 1. User 데이터 삽입
export const addUser = async (data: any): Promise<number | null> => {
// export const addUser = async (data: any): Promise<number | null> => {
//   const conn = await pool.getConnection();


  try {
    // 1. 이미 존재하는 이메일인지 확인
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      return null;
    }
//     const [confirm] = await pool.query<RowDataPacket[]>(
//       `SELECT EXISTS(SELECT 1 FROM user WHERE email = ?) as isExistEmail;`,
//       [data.email]
//     );

//     if (confirm[0]?.isExistEmail) {
//       return null;
//     }

    // 2. User 생성
    const createdUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        gender: data.gender,
        birth: data.birth,
        address: data.address,
        detailAddress: data.detailAddress,
        phoneNumber: data.phoneNumber,
        password: data.password, // TODO: 비밀번호 해싱
      },
    });
//     const [result] = await pool.query<ResultSetHeader>(
//       `INSERT INTO user
//       (email, name, gender, birth, address, detail_address, phone_number, password) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
//       [
//         data.email,
//         data.name,
//         data.gender,
//         data.birth,
//         data.address,
//         data.detailAddress,
//         data.phoneNumber,
//         data.password, //  🔥 비밀번호 해싱
//       ]
//     );

    return Number(createdUser.id);
  } catch (err) {
    throw new Error(`오류가 발생했어요: ${err}`);
  }
//     return result.insertId;
//   } catch (err) {
//     throw new Error(`오류가 발생했어요: ${err}`);
//   } finally {
//     conn.release();
//   }

};



// 2. 사용자 정보 조회
export const getUser = async (userId: number) => {
  const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });
  return user;
};


// 3. 음식 선호 카테고리 매핑
export const setPreference = async (
  userId: number, 
  foodCateforyId: number
) => {
  await prisma.userFavorCategory.create({
    data: {
      userId: userId,
      foodCategoryId: foodCateforyId,
    }
  });
};


// 4. 사용자 선호 카테고리 반환 : SQL의 join 처리

export const getUserPreferencesByUserId = async (
  userId: number
) => {
  const preferences = await prisma.userFavorCategory.findMany({
/*  "SELECT ufc.id, ufc.food_category_id, ufc.user_id, fcl.name " +
    "FROM user_favor_category ufc JOIN food_category fcl on ufc.food_category_id = fcl.id " +
    "WHERE ufc.user_id = ? ORDER BY ufc.food_category_id ASC;",
      [userId]*/
    where: {userId: userId},
    include: {foodCategory: true}, // userFavorCategory와 관계를 맺고 있는 foodCategory 테이블을 자동으로 join해 name 필드를 가져온다
    orderBy: {foodCategoryId: "asc"}
  });
};
