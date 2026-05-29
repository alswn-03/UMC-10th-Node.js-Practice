/* 데이터를 원하는 형태로 바꿔준다*/

// ❇️ 7주차 : Tsoa 방식으로 DTO 설계하기
// 1. 별도로 존재하던 변환함수를 제거하고, interface만 남기도록 수정한다
// 2. service 레이어 수정

// 1. 요청 DTO
export interface UserSignUpRequest {
  /** 유저 이메일 (로그인 시 사용) */
  email: string;
  /** 비밀번호 (서버에서 bcrypt로 해싱하여 저장) */
  password: string;
  /** 유저 이름 */
  name: string;
  /** 성별 (예: "male", "female") */
  gender: string;
  /** 생년월일 (예: "1999-01-01") */
  birth: Date;
  /** 기본 주소 (선택) */
  address?: string;
  /** 상세 주소 (선택) */
  detailAddress?: string;
  /** 휴대폰 번호 (예: "010-1234-5678") */
  phoneNumber: string;
  /** 선호 카테고리 ID 배열 (예: [1, 2]) */
  preferences: number[];
}
/* ❇️ 7주차 
@Body 데코레이터가 자동으로 bodyToUser가 하던 역할인 '파싱'을 해주기 때문에, 이러한 상황에서는 별도의 변환 함수가 필요하지 않아요.
즉, @Body() requestBody: UserSignUpRequest 라고 선언하면, Tsoa가 자동으로 요청 본문을 UserSignUpRequest 타입으로 변환해줍니다. 따라서 bodyToUser 함수는 더 이상 필요하지 않게 됩니다.
만약 요청 데이터에 추가적인 변환이나 검증이 필요하다면, 그 때는 별도의 변환 함수를 만들어서 service 레이어에서 호출하는 방식으로 구현할 수 있습니다. 하지만 현재 상황에서는 @Body 데코레이터가 이미 필요한 역할을 해주고 있기 때문에, 별도의 변환 함수는 필요하지 않습니다.
*/
/*
// 2.설계도(interface)대로 변환 함수
// 클라이언트의 요청 데이터를 서버 내부에서 쓰기 좋게 하려고
export const bodyToUser = (body: UserSignUpRequest) => {
  const birth = new Date(body.birth); 

  return {
    email: body.email, //필수 
    password: body.password, 
    name: body.name, // 필수
    gender: body.gender, // 필수
    birth, //
    address: body.address || "", //선택 
    detailAddress: body.detailAddress || "", //선택 
    phoneNumber: body.phoneNumber,//필수
    preferences: body.preferences,// 필수 
  };
}; */


// 3. DB에서 가져온 유저 정보 + 선호 카테고리 목록을 클라이언트 응답 형태로 변환
// DB에서 가져온 결과를 클라이언트에게 보여줄 응답 형태로 바꾸려고
export interface UserSignUpResponse {
  /** 가입된 이메일 */
  email: string;
  /** 가입된 유저 이름 */
  name: string;
  /** 선택한 선호 카테고리 이름 배열 (예: ["한식", "중식"]) */
  preferCategory: string[];
}

// Google 로그인 유저처럼 처음에 정보를 채우지 못한 경우 사용하는 프로필 수정 DTO
// 모든 필드가 선택(?)이라 원하는 필드만 골라서 수정할 수 있다
export interface UserUpdateRequest {
  /** 유저 이름 */
  name?: string;
  /** 성별 (예: "male", "female") */
  gender?: string;
  /** 생년월일 (예: "1999-01-01") */
  birth?: Date;
  /** 기본 주소 */
  address?: string;
  /** 상세 주소 */
  detailAddress?: string;
  /** 휴대폰 번호 (예: "010-1234-5678") */
  phoneNumber?: string;
}

export interface UserUpdateResponse {
  /** 유저 ID */
  id: number;
  /** 유저 이메일 */
  email: string;
  /** 유저 이름 */
  name: string;
}
/* ❇️ 7주차 
responseFromUser 변환 함수의 역할은 @Body 데코레이터가 하던 역할과는 다릅니다.
- @Body 데코레이터는 클라이언트로부터 들어오는 요청 데이터를 서버 내부에서 쓰기 좋게 변환하는 역할을 합니다. 예를 들어, JSON 형태의 요청 본문을 UserSignUpRequest 타입으로 변환하는 역할을 합니다.
- responseFromUser 함수는 DB에서 가져온 유저 정보와 선호 카테고리 목록을 클라이언트에게 보여줄 응답 형태로 변환하는 역할을 합니다. 즉, service 레이어에서 DB에서 조회한 데이터를 UserSignUpResponse 형태로 변환하는 역할을 합니다.
 이 경우 responseFromUser 함수를 유지할 수 도 있고,
 만약 변환 로직이 간단하다면, service 레이어에 로직을 추가할 수 도 있다
*/
/*
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
};*/

// 배열.map((각요소) => {
//   return 변환값;
// })