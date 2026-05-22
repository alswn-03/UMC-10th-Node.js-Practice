/* 데이터를 원하는 형태로 바꿔준다*/

// ❇️ 7주차 : Tsoa 방식으로 DTO 설계하기
// 1. 별도로 존재하던 변환함수를 제거하고, interface만 남기도록 수정한다
// 2. service 레이어 수정

// 1. 요청 DTO
export interface UserSignUpRequest {
  email: string;
  password: string, // 🔥 비밀번호 해싱
  name: string;
  gender: string;
  birth: Date;
  address?: string;       // ?가 붙으면 '없을 수도 있음(선택)'이라는 뜻이에요!
  detailAddress?: string;
  phoneNumber: string;
  preferences: number[];
}
// 2.설계도(interface)대로 변환 함수
// 클라이언트의 요청 데이터를 서버 내부에서 쓰기 좋게 하려고
export const bodyToUser = (body: UserSignUpRequest) => {
  const birth = new Date(body.birth); //✅ 날짜 변환

  return {
    email: body.email, //필수 
    password: body.password, // 🔥 비밀번호 해싱
    name: body.name, // 필수
    gender: body.gender, // 필수
    birth, // ✅ 필수
    address: body.address || "", //선택 
    detailAddress: body.detailAddress || "", //선택 
    phoneNumber: body.phoneNumber,//필수
    preferences: body.preferences,// 필수 
  };
};


// 3. DB에서 가져온 유저 정보 + 선호 카테고리 목록을 클라이언트 응답 형태로 변환
// DB에서 가져온 결과를 클라이언트에게 보여줄 응답 형태로 바꾸려고
export interface UserSignUpResponse {
  email: string;
  name: string;
  preferCategory: string[];
}
export const responseFromUser = (
  data: {
    user: any;
    preferences: any[];
  }
): UserSignUpResponse => {

  return {
    email: data.user.email,
    name: data.user.name,
    preferCategory: data.preferences.map(
      (p) => p.foodCategory.name
    ),
  };
};

// 배열.map((각요소) => {
//   return 변환값;
// })