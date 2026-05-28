# Week 08 이론 정리

---

## 1. Swagger & OpenAPI

### 이론
- **OpenAPI**는 REST API의 구조(엔드포인트, 파라미터, 응답 형식 등)를 기계가 읽을 수 있는 형식(JSON/YAML)으로 표현하는 **명세(Specification) 표준**이다.
- **Swagger**는 그 명세를 시각화해주는 **UI 도구**다. `/docs`에서 API를 직접 테스트할 수 있다.
- 결국 OpenAPI = 설계도 포맷, Swagger UI = 설계도를 보여주는 뷰어.

### 암기
```
OpenAPI Spec (swagger.json)
       ↓ 읽음
Swagger UI (/docs) → 브라우저에서 API 문서 + 직접 테스트 가능
```

### 실기 — 이 프로젝트에서의 세팅
```typescript
// index.ts
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve("dist/swagger.json"), "utf8")
);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
```
> `swagger.json`은 TSOA가 자동 생성해줌 → 직접 쓸 필요 없음

---

## 2. TSOA (TypeScript-first OpenAPI)

### 이론
- Express에서는 라우트 정의(`app.get(...)`)와 API 문서가 **따로 존재**해서, 코드가 바뀌어도 문서는 그대로인 문제가 생긴다.
- TSOA는 **데코레이터를 코드에 직접 붙여서** 라우트 등록 코드(`routes.ts`)와 `swagger.json`을 **동시에 자동 생성**한다.
- 즉, 코드 = 문서. 코드가 바뀌면 문서도 같이 바뀐다.

### 암기 — 핵심 데코레이터

| 데코레이터 | 위치 | 역할 |
|---|---|---|
| `@Route("users")` | 클래스 | URL 경로 prefix 설정 |
| `@Tags("User")` | 클래스 | Swagger에서 API 그룹 이름 |
| `@Get / @Post / @Put / @Delete` | 메서드 | HTTP 메서드 + 세부 경로 |
| `@Body()` | 파라미터 | req.body 파싱 (타입 자동 검증) |
| `@Path()` | 파라미터 | URL 경로 변수 (`:id` → `{id}`) |
| `@Query()` | 파라미터 | 쿼리스트링 파싱 (`?cursor=0`) |
| `@Response<T>(상태코드, "설명")` | 메서드 | 응답 케이스 문서화 |

### 암기 — 클래스 구조
```typescript
@Route("stores")        // /api/v1/stores
@Tags("Mission")        // Swagger 탭 이름
export class StoreMissionController extends Controller {

  @Post("missions")                                    // POST /stores/missions
  @Response<ErrorResponse>(400, "존재하지 않는 가게")   // 실패 케이스 문서화
  public async handleAddMission(
    @Body() requestBody: AddMissionRequest             // body 파싱 + 타입 검증
  ): Promise<ApiResponse<AddMissionResponse>> {        // 성공 케이스는 반환 타입으로
    ...
  }

  @Get("{storeId}/missions")                           // GET /stores/{storeId}/missions
  public async handleGetMissionsByStore(
    @Path() storeId: number,                           // URL 경로 변수
    @Query() cursor?: number                           // 쿼리스트링 (선택)
  ): Promise<MissionListByStoreResponse> {
    ...
  }
}
```

### 실기 — TSOA 실행 흐름
```
컨트롤러에 데코레이터 작성
       ↓
npx tsoa spec-and-routes   (또는 npm run tsoa)
       ↓
src/generated/routes.ts    ← Express 라우트 자동 생성
dist/swagger.json          ← OpenAPI 명세 자동 생성
       ↓
index.ts에서 RegisterRoutes(router) 한 번만 호출하면 끝
```

### 실기 — tsoa.json 설정
```json
{
  "entryFile": "src/index.ts",
  "controllerPathGlobs": ["src/**/*.controller.ts"],  // 컨트롤러 파일 자동 탐색
  "spec": {
    "outputDirectory": "dist",
    "specVersion": 3,
    "basePath": "/api/v1"
  },
  "routes": {
    "routesDir": "src/generated"
  }
}
```

---

## 3. Type-Driven Documentation

### 이론
- 문서를 별도로 작성하지 않고, **TypeScript 타입(interface)과 JSDoc 주석이 곧 문서**가 되는 방식.
- TSOA는 interface의 필드명, 타입, `/** */` 주석을 읽어서 Swagger에 자동으로 반영한다.
- 장점: 타입과 문서가 항상 동기화됨. 따로 관리할 게 없음.

### 암기 — 무엇이 문서가 되는가

| 코드 요소 | Swagger에서 |
|---|---|
| 메서드의 `/** @summary ... */` | API 제목 |
| 메서드의 `/** 설명 */` | API 상세 설명 |
| `@Body()` 파라미터 타입 (`interface`) | Request body 스키마 |
| interface 필드의 `/** 주석 */` | 각 필드 설명 |
| 메서드 반환 타입 | 200 응답 스키마 |
| `@Response<T>(400, "설명")` | 에러 응답 스키마 |

### 실기 — DTO 주석 패턴
```typescript
export interface AddMissionRequest {
  /** 미션을 등록할 가게 ID */
  storeId: number;
  /** 미션 완료 시 지급할 포인트 */
  reward: number;
  /** 미션 마감일 (예: "2025-12-31") */
  deadline: string;
  /** 미션 내용 설명 */
  missionSpec: string;
}
```
> 이 주석들이 Swagger의 각 필드 description으로 그대로 들어간다.

### 실기 — 에러 응답 타입을 따로 정의해야 하는 이유
```typescript
// @Response 데코레이터는 제네릭 타입을 요구한다.
// 타입이 없으면 Swagger에서 에러 응답의 body 구조가 비어있게 된다.

@Response<ErrorResponse>(400, "존재하지 않는 가게")  // ← ErrorResponse가 body 스키마
```
```typescript
// response.ts
export interface ErrorResponse {
  resultType: "FAIL";
  error: { errorCode: string; reason: string; data: unknown | null };
  success: null;
}
```

---

## 한 줄 요약

| 개념 | 한 줄 |
|---|---|
| OpenAPI | API 구조를 JSON으로 표현하는 표준 명세 |
| Swagger UI | OpenAPI 명세를 시각화 + 테스트하는 도구 |
| TSOA | 데코레이터로 라우트 코드와 swagger.json을 동시에 자동 생성 |
| Type-Driven-Documentation | TypeScript 타입과 JSDoc이 곧 API 문서가 되는 방식 |
