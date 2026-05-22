/*DB 직접 접근 - SQL*/
import { prisma } from "../../../db.config.js";

// 1. User 데이터 삽입
export const addUser = async (data: any): Promise<number | null> => {
//   const conn = await pool.getConnection();


  try {

// ✅ 1. 이미 존재하는 이메일인지 확인
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      return null;
    }
//  const [confirm] = await pool.query<RowDataPacket[]>(
//    `SELECT EXISTS(SELECT 1 FROM user WHERE email = ?) as isExistEmail;`,
//    [data.email]
//  );

//  if (confirm[0]?.isExistEmail) {
//    return null;
//  }

// ✅ 2. DB에 insert - User 생성
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
//  const [result] = await pool.query<ResultSetHeader>(
//    `INSERT INTO user
//    (email, name, gender, birth, address, detail_address, phone_number, password) 
//    VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
//    [
//      data.email,
//      data.name,
//      data.gender,
//      data.birth,
//      data.address,
//      data.detailAddress,
//      data.phoneNumber,
//      data.password, //  🔥 비밀번호 해싱
//    ]
//  );

    return Number(createdUser.id);
  } catch (err) {
    throw new Error(`오류가 발생했어요: ${err}`);
  }
//  return result.insertId;
//} catch (err) {
//  throw new Error(`오류가 발생했어요: ${err}`);
//} finally {
//  conn.release();
//}

};



// 2. 사용자 정보 조회
export const getUser = async (userId: number) => {
// userId와 일치하는 사용자 1명을 DB에서 조회
// findFirstOrThrow는 조건에 맞는 첫 번째 데이터를 찾고, 없으면 에러를 발생시킨다.
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
    // SELECT * FROM user WHERE id = ?;
  });

  return user; // 조회한 사용자 정보를 반환
};


// 3. 음식 선호 카테고리 매핑
export const setPreference = async (
  userId: number,
  foodCateforyId: number
) => {
  // user_favor_category 테이블에 사용자-음식 카테고리 관계를 저장
  await prisma.userFavorCategory.create({
    data: {
      userId: userId, // 어떤 사용자의 선호 카테고리인지 저장
      foodCategoryId: foodCateforyId, // 사용자가 선호하는 음식 카테고리 id 저장

    // INSERT INTO user_favor_category (user_id, food_category_id)
    // VALUES (?, ?);
    },
  });
};




// 4. 사용자 선호 카테고리 반환 : SQL의 join 처리

export const getUserPreferencesByUserId = async (
  userId: number
) => {
  const preferences = await prisma.userFavorCategory.findMany({
    where: {userId: userId},
    include: {foodCategory: true}, // userFavorCategory와 관계를 맺고 있는 foodCategory 테이블을 자동으로 join해 name 필드를 가져온다
    orderBy: {foodCategoryId: "asc"}
/*  "SELECT ufc.id, ufc.food_category_id, ufc.user_id, fcl.name " +
    "FROM user_favor_category ufc JOIN food_category fcl on ufc.food_category_id = fcl.id " +
    "WHERE ufc.user_id = ? ORDER BY ufc.food_category_id ASC;",
      [userId]*/
  });
  return preferences;
};
