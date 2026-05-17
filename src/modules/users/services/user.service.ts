import { UserSignUpRequest } from "../dtos/user.dto.js"; //인터페이스 가져오기 
import { responseFromUser } from "../dtos/user.dto.js";
import bcrypt from "bcrypt";  // 🔥 비밀번호 해싱

import {
  addUser,
  getUser,
  getUserPreferencesByUserId,
  setPreference,
} from "../repositories/user.repository.js";



export const userSignUp = async (data: UserSignUpRequest) => {
  
  const saltRounds = 10;
  // 🔥 비밀번호 해싱 - 비즈니스 로직 처리 (암호화, 검증 등)
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  // ✅ Repository 호출해서 DB에 저장
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
    throw new Error("이미 존재하는 이메일입니다.");
  }

  // ✅ 추가 처리 (preference 설정 등)
  for (const preference of data.preferences) {
    await setPreference(joinUserId, preference);
  }

  const user = await getUser(joinUserId);
  const preferences = await getUserPreferencesByUserId(joinUserId);

  // ✅ DTO로 응답 형태 변환
  return responseFromUser({ user, preferences });
};