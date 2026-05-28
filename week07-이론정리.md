# Week 07 - tsoa 이론 정리

---

## tsoa가 뭔데?

tsoa는 **TypeScript + OpenAPI**의 합성어다. 쉽게 말하면 **TypeScript 코드에 데코레이터를 붙이면, 라우트 코드와 Swagger 문서를 자동으로 만들어주는 도구**다.

Express를 쓰면 원래 이렇게 해야 한다:

1. 라우트 직접 작성 (`app.post('/users/signup', handler)`)
2. Swagger 문서 별도 작성
3. 요청 바디 타입 직접 검증

tsoa를 쓰면:

1. 컨트롤러에 `@Route`, `@Post`, `@Body` 같은 데코레이터만 붙이면
2. `npm run build` 시점에 라우트 코드와 Swagger 스펙을 **자동 생성**해줌

---

## 파일별로 뭐가 바뀌는가

### `tsoa.json` (새로 생김)

tsoa의 설정 파일이다. 어디서 컨트롤러를 찾고, 어디에 파일을 생성할지 알려준다.

```json
{
  "entryFile": "src/index.ts",
  "noImplicitAdditionalProperties": "throw-on-extras",
  "controllerPathGlobs": ["src/**/*.controller.ts"],
  "spec": {
    "outputDirectory": "dist",
    "specVersion": 3
  },
  "routes": {
    "routesDir": "src/generated"
  }
}
```

- `controllerPathGlobs`: 어떤 파일에서 컨트롤러를 찾을지
- `noImplicitAdditionalProperties: "throw-on-extras"`: 인터페이스에 없는 필드가 요청에 오면 에러를 던짐 (엄격한 검증)
- `routes.routesDir`: 자동 생성될 `routes.ts`가 저장될 위치

---

### `src/generated/routes.ts` (자동 생성됨)

**절대 직접 수정하면 안 된다.** `npm run start` 또는 `tsoa spec-and-routes` 명령 실행 시 자동으로 생성된다.

이 파일이 하는 일:

- 컨트롤러의 데코레이터를 읽어서 실제 Express 라우트를 등록
- 요청 바디를 DTO 인터페이스 기준으로 **런타임 검증**
- 필수 필드 누락, 타입 불일치 등을 잡아줌

```ts
// routes.ts가 자동으로 이런 코드를 만들어준다
app.post('/users/signup', async function(request, response, next) {
  // UserSignUpRequest 기준으로 요청 바디 자동 검증
  validatedArgs = templateService.getValidatedArgs({ ... });
  // 검증 통과하면 컨트롤러 메서드 호출
  await controller.handleUserSignUp(validatedArgs);
});
```

---

### `controller.ts` (데코레이터 방식으로 변경)

Express 방식에서는 함수 형태였다면, tsoa 방식은 **클래스 + 데코레이터**다.

```ts
// 이전 (Express 방식)
export const handleUserSignUp = async (req: Request, res: Response) => {
  const user = await userSignUp(bodyToUser(req.body));
  res.status(200).json({ result: user });
};

// 이후 (tsoa 방식)
@Route("users")           // → /users 경로
@Tags("User")             // Swagger 태그
export class UserController extends Controller {
  @Post("signup")         // → POST /users/signup
  public async handleUserSignUp(
    @Body() requestBody: UserSignUpRequest
  ): Promise<UserSignUpResponse> {
    const user = await userSignUp(requestBody);
    return user;
  }
}
```

**핵심 차이**: `req.body`를 직접 꺼내지 않고 `@Body() requestBody`로 받는다. tsoa가 자동으로 파싱 + 검증을 해주기 때문이다.

---

### `index.ts` (라우트 등록 방식 변경)

Express 방식에서는 각 핸들러를 직접 연결했다. tsoa 방식에서는 `RegisterRoutes` 한 번이면 끝이다.

```ts
// 이전 (Express 방식)
app.post("/api/v1/users/signup", handleUserSignUp);
app.get("/api/v1/stores/:storeId/reviews", handleListStoreReviews);
// ... 엔드포인트마다 한 줄씩

// 이후 (tsoa 방식)
const router = express.Router();
RegisterRoutes(router);         // 모든 라우트가 한 번에 등록됨
app.use("/api/v1", router);    // 공통 prefix 설정
```

> 주의: `app.use("/api/v1", router)`로 prefix를 붙이면, 컨트롤러의 `@Route`에는 `/api/v1`을 **빼야** 한다.
> `@Route("api/v1/users")`로 쓰면 실제 경로가 `/api/v1/api/v1/users`가 되어 404가 난다.

---

### `dto.ts` (변환 함수 제거 또는 유지)

이게 이번 주차에서 가장 헷갈리는 부분이다.

#### Express 방식에서 변환 함수가 필요했던 이유

```ts
// req.body는 any 타입이라 직접 변환이 필요했다
export const bodyToUser = (body: UserSignUpRequest) => {
  const birth = new Date(body.birth); // 날짜 변환
  return {
    ...body,
    birth,
    address: body.address || "", // 기본값 처리
  };
};
```

#### tsoa에서 `bodyToUser`가 필요 없어지는 이유

`@Body() requestBody: UserSignUpRequest`를 쓰는 순간, tsoa가 `routes.ts`를 통해 요청 바디를 자동으로 파싱하고 검증해준다. `req.body`가 `any`가 아니라 이미 타입이 확정된 객체로 들어온다.

즉, **tsoa가 `bodyToUser`의 파싱 역할을 대신하는 것이다.**

---

## 선택지: 변환 함수를 유지할까, 제거할까?

`responseFromUser` 같은 응답 변환 함수는 취향/팀 컨벤션에 따라 선택할 수 있다.

### 선택지 1: 서비스 레이어에 인라인 (교안 방식)

```ts
// service.ts
return {
  userId,
  preferences: preferences.map((p) => p.foodCategory.name),
};
```

- 코드 양이 적고 단순함
- 학습용, 소규모 프로젝트에 적합

### 선택지 2: 변환 함수 분리 유지

```ts
// dto.ts
export const responseFromUser = (data: { user: any; preferences: any[] }): UserSignUpResponse => ({
  email: data.user.email,
  name: data.user.name,
  preferCategory: data.preferences.map((p) => p.foodCategory.name),
});

// service.ts
return responseFromUser({ user, preferences });
```

- 변환 함수만 따로 단위 테스트 가능
- 같은 변환 로직을 여러 곳에서 재사용 가능
- 프로젝트 규모가 커질수록 유리

**정답은 없다.** tsoa 입장에서 중요한 건 컨트롤러 메서드의 **반환 타입**이지, 변환 함수의 존재 여부가 아니기 때문이다.

---

## tsoa 동작 흐름 요약

```
클라이언트 요청
      ↓
index.ts (app.use("/api/v1", router))
      ↓
generated/routes.ts (자동 생성, 요청 바디 검증)
      ↓
controller.ts (@Route, @Post, @Body 데코레이터)
      ↓
service.ts (비즈니스 로직, bcrypt, DB 호출)
      ↓
repository.ts (Prisma로 실제 DB 조작)
      ↓
응답 반환 (UserSignUpResponse 타입)
```
