import { UserSignUpRequest, UserSignUpResponse, UserUpdateRequest, UserUpdateResponse } from "../dtos/user.dto.js";
import bcrypt from "bcrypt";  // 🔥 비밀번호 해싱

import {
  addUser,
  getUser,
  getUserPreferencesByUserId,
  setPreference,
  updateUser,
} from "../repositories/user.repository.js";
import { AppError } from "../../../common/errors/AppError.js";



export const userSignUp = async (data: UserSignUpRequest) => {
  
  const saltRounds = 10;
  // 비밀번호 해싱 - 비즈니스 로직 처리 (암호화, 검증 등)
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  // Repository 호출해서 DB에 저장
  const joinUserId = await addUser({
    email: data.email,
    name: data.name,
    gender: data.gender,
    birth: new Date(data.birth), // 문자열을 Date 객체로 변환해서 넘겨줍니다. 
    address: data.address,
    detailAddress: data.detailAddress,
    phoneNumber: data.phoneNumber,
    password: hashedPassword, // 🔥 해싱된 값 저장
  });

  if (joinUserId === null) {
    throw new AppError({
      errorCode: "U001",
      statusCode: 409,
      message: "이미 존재하는 이메일입니다.",
    });
  }

  for (const preference of data.preferences) {
    await setPreference(joinUserId, preference);
  }

  const user = await getUser(joinUserId);
  const preferences = await getUserPreferencesByUserId(joinUserId);

  // ❇️ 7주차 : responseFromUser 함수의 로직 service 레이어로 인라인(이동시킴)
  // return responseFromUser({ user, preferences });
  return <UserSignUpResponse>{
    email: user.email,
    name: user.name,
    preferCategory: preferences.map((p) => p.foodCategory.name),
  };
};


export const updateUserProfile = async (
  userId: number,
  data: UserUpdateRequest
): Promise<UserUpdateResponse> => {
  const updated = await updateUser(userId, data);

  return {
    id: Number(updated.id),
    email: updated.email,
    name: updated.name,
  };
};