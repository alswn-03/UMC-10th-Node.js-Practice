export interface ApiResponse<T> {
  resultType: "SUCCESS";
  error: null;
  success: T;
}

export const success = <T>(data: T): ApiResponse<T> => ({
  resultType: "SUCCESS",
  error: null,
  success: data,
});

export interface ErrorDetail {
  /** 에러 코드 (예: U001, M001) */
  errorCode: string;
  /** 에러 메시지 */
  reason: string;
  data: unknown | null;
}

/**
 * 공통 실패 응답 형식.
 * tsoa의 @Response 데코레이터는 제네릭 타입으로 응답 body의 형식을 지정하는데,
 * 에러 응답 타입이 없으면 Swagger에서 실패 케이스의 응답 구조가 문서화되지 않는다.
 * 전역 에러 핸들러(index.ts)가 AppError를 이 형식으로 변환하므로, 이를 타입으로 정의한다.
 */
export interface ErrorResponse {
  resultType: "FAIL";
  error: ErrorDetail;
  success: null;
}
