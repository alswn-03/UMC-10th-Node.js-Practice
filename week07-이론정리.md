# 🚀 [week7 핵심 keyword]
## 1. 미들웨어

클라이언트의 **요청(Request)** 과 서버의 최종 **응답(Response)** 그 중간(Middle)에 위치해서 작업을 수행하는 함수입니다.

### 공장 컨베이어 벨트 비유

* **사용자의 요청**

  * 공장 컨베이어 벨트에 올라감

* **작업자(미들웨어)**

  * 컨베이어 벨트 내에 배치되고, 각각의 임무를 수행

  * **작업자 A (로깅)**

    * 로그 기록
    * 요청이 들어온 시간을 장부에 기록

  * **작업자 B (파싱)**

    * 포장된 상자를 뜯어 내용물(데이터)을 요리하기 쉽게 정리

  * **작업자 C (인증)**

    * 출입증(토큰)이 있는지 검사
    * 없으면 상자를 밖으로 던짐, 즉 에러 차단

* **최종 조립자(컨트롤러)**

  * 검사를 모두 통과한 상자를 받아 최종 결과물, 즉 응답을 만듦

---

## 2. HTTP 상태 코드

HTTP 상태 코드는 클라이언트의 요청에 대해 서버가 어떤 결과를 반환했는지 알려주는 코드입니다.

### 대표적인 상태 코드

참고: [[Network] HTTP 상태 코드 정리 (100, 200, 300, 400, 500)](https://recordevelop.tistory.com/entry/Network-HTTP-%EC%83%81%ED%83%9C-%EC%BD%94%EB%93%9C-%EC%A0%95%EB%A6%AC-100-200-300-400-500)

### 성공(Successful)

* `200 OK`

  * 요청이 정상적으로 처리됨
  * 가장 많이 보는 성공 코드

* `201 Created`

  * 요청이 성공적으로 처리되어 리소스가 새로 생성됨

### 리다이렉션(Redirection)

* `301 Moved Permanently`

  * 요청한 리소스가 영구적으로 다른 위치로 이동

### 클라이언트 오류(Client Error)

* `400 Bad Request`

  * 잘못된 문법 등으로 서버가 요청을 이해할 수 없음

* `401 Unauthorized`

  * 인증이 필요하거나 인증 실패

* `403 Forbidden`

  * 서버가 요청을 이해했지만 권한 부족 등으로 거부

* `404 Not Found`

  * 요청한 리소스, 페이지 등을 찾을 수 없음
  * 존재하지 않는 페이지

### 서버 오류(Server Error)

* `500 Internal Server Error`

  * 서버 내부 오류로 요청 처리 실패

* `502 Bad Gateway`

  * 게이트웨이/프록시 서버가 잘못된 응답을 받음

* `503 Service Unavailable`

  * 서버가 일시적으로 요청을 처리할 수 없음
  * 과부하, 점검 등

---

## 3. 에러 핸들링(Error Handling)

에러 핸들링은 **실패 응답을 통일하는 것**입니다.

예외나 에러가 발생했을 때, 사전에 정의해둔 규격의 실패 응답(Error Response)을 보냅니다.

### 예시

* 응답 규격을 통일
* 식별 코드 사용

  * `U001`: 이메일 중복

즉, 에러가 발생할 때마다 제각각 다른 형태로 응답하는 것이 아니라, 정해진 형식에 맞춰 일관된 실패 응답을 내려주는 방식입니다.

---

## 4. TSOA

TSOA는 **TypeScript 코드를 기반으로 OpenAPI(Swagger) 명세와 라우팅 코드를 자동으로 생성해 주는 Node.js 라이브러리**입니다.

---

### 0. Express 프레임워크

Node.js로 백엔드를 개발할 때, 대부분의 사람들이 Express를 함께 사용합니다.

인기 있는 서버 프레임워크인 Nest.js도 기본적으로는 Express를 기반으로 하고 있습니다.

따라서 Express는 사실상 Node.js의 표준 서버 프레임워크라고 불릴 정도로 많이 사용됩니다.

Express는 가볍고 유연해서 개발자가 원하는 대로 다음 작업을 할 수 있습니다.

* 라우팅 연결
* 데이터 타입 검사
* API 명세서(Swagger) 작성

하지만 프로젝트가 커지면 이 유연함이 단점으로 작용할 수 있습니다.

* 반복 작업 증가
* 통일성 부족
* API 문서와 실제 코드가 달라질 가능성 증가

---

### 1. TSOA

TSOA는 Express 프레임워크 위에 올라가는 컴파일러라고 볼 수 있습니다.

과거에는 백엔드 개발자가 다음 3가지 작업을 직접 해야 했습니다.

1. **로직 짜기**

   * “회원가입 기능 만들어야지.”
   * TypeScript 코드 작성

2. **길 연결하기**

   * “이 기능을 `/users/signup` 주소랑 연결해야지.”
   * Express 라우팅 설정

3. **설명서 쓰기**

   * “프론트엔드한테 줄 API 문서 업데이트해야지.”
   * Swagger 수기 작성

그래서 TSOA가 등장했습니다.

개발자가 1번, 즉 **로직 짜기 + 데코레이터 `@` 붙이기**만 제대로 해두면, TSOA가 명령어를 통해 아래 2가지를 자동으로 해줍니다.

* **Express 라우팅**
* **API 문서 생성**

---

### 2. TSOA에서 미들웨어의 중요성

Express의 장점은 미들웨어를 원하는 위치에 마음대로 꽂아 넣을 수 있다는 점입니다.

```ts
app.get('/mypage', 인증미들웨어, 함수)
```

즉, 특정 API가 실행되기 전에 인증 미들웨어를 먼저 실행하도록 직접 연결할 수 있습니다.

하지만 TSOA는 자기가 알아서 완성된 컨베이어 벨트, 즉 `routes.ts`를 만들어버립니다.

그래서 개발자가 수동으로 중간에 작업자를 끼워 넣기가 애매해질 수 있습니다.

결론적으로, TSOA는 데코레이터를 참고해 미들웨어 작업자를 알맞은 위치에 배치해줍니다.

---

### 2-1. 전역 미들웨어

모든 방문자가 무조건 거쳐야 하는 기본 작업자들은 기존 Express 방식과 똑같이 메인 파일인 `index.ts`에 세워둡니다.

예시 미들웨어는 다음과 같습니다.

* `morgan`

  * 꼼꼼한 CCTV
  * 로그 기록

* `cookie-parser`

  * 복잡한 이름표 해독가
  * 쿠키 파싱

* `express.json()`

  * 택배 상자 해체반
  * 바디 파싱

적용 방법은 TSOA가 만든 자동 라우터를 연결하기 전에 `app.use(미들웨어)`로 맨 앞에 두는 것입니다.

```ts
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

// 이후 TSOA routes 연결
RegisterRoutes(app);
```

---

### 2-2. `@Middlewares` 데코레이터

이번 워크북 실습의 핵심입니다.

모든 API가 아니라 특정 페이지, 특정 API에만 미들웨어를 적용하고 싶을 때 사용합니다.

예를 들어 `authorizeUser()` 같은 커스텀 인가 미들웨어를 특정 컨트롤러나 특정 메서드에만 붙일 수 있습니다.

* `authorizeUser()`

  * 마이페이지처럼 비회원 출입을 막는 VIP 구역 경호원
  * 쿠키 또는 세션 확인

---

### 2-3. `@Security` 데코레이터

`@Security` 데코레이터는 JWT 토큰 기반의 본격적인 보안 인증 검사를 적용할 때 사용합니다.

예를 들어 로그인한 사용자만 접근할 수 있는 API라면 다음과 같이 사용할 수 있습니다.

```ts
@Security("jwt")
```

이렇게 작성하면 TSOA는 해당 API에 접근하기 전에 JWT 토큰 검사를 먼저 수행하도록 라우팅 코드를 생성합니다.

---

### 3. Routes 레이어

Routes 레이어는 **데코레이터가 적용된 컨트롤러 코드를 기반으로 자동 생성되는 Express 라우팅 파일**입니다.

`tsoa routes` 명령을 통해 생성되며, 컨트롤러와 HTTP 프레임워크 사이를 연결하는 접착제 역할을 합니다.

---

### 3-1. Routes 레이어의 역할

Routes 레이어의 핵심 역할은 다음과 같습니다.

1. 자동 라우팅 생성
2. 검증 레이어
3. 보안 및 미들웨어 통합
4. 엔드포인트 연결

---

### 3-2. 자동 라우팅 생성

컨트롤러에 작성된 `@Route`, `@Get`, `@Post` 등의 데코레이터를 분석하여 라우트 설정 파일을 자동으로 생성합니다.

즉, 개발자가 직접 Express 라우터를 하나하나 연결하지 않아도 됩니다.

---

### 3-3. 데코레이터(Decorator)

데코레이터는 단어 뜻 그대로 코드에 달아주는 장식입니다.

컴퓨터가 읽을 수 있는 스마트 포스트잇, 즉 이름표라고 볼 수 있습니다.

TypeScript에서는 골뱅이(`@`) 기호로 시작합니다.

TSOA 비서, 즉 컴파일러는 개발자가 코드 위에 붙여둔 이 포스트잇을 읽고 라우팅 파일과 API 문서(Swagger)를 만들어냅니다.

---

### 3-4. 데코레이터의 종류

#### 1. 길 안내 포스트잇

“비서야, 손님이 이 주소로, 이런 방식으로 찾아오면 이 함수를 실행시켜!”

* `@Route("users")`

  * 이 클래스 안에 있는 기능들은 전부 기본 주소가 `/users`로 시작한다는 의미
  * 건물 입구의 큰 간판 같은 역할

* `@Get("{id}")`

  * 누군가 데이터를 조회(GET)하려고 `/users/1`처럼 번호를 들고 오면 이 문을 열어달라는 의미

* `@Post("signup")`

  * 누군가 데이터를 생성(POST)하려고 `/users/signup` 주소로 찾아오면 이 문을 열어달라는 의미

---

#### 2. 준비물 검사 포스트잇

“비서야, 이 함수를 실행하려면 손님한테 이런 형태의 데이터를 꼭 받아와야 해!”

* `@Body()`

  * 손님이 요청의 본문(Body)에 데이터를 숨겨서 올 텐데, 그 데이터가 우리가 정한 규격에 맞는지 검사하고 넘겨달라는 의미

* `@Path("id")`

  * 주소창에 적힌 숫자, 예를 들어 `/users/1`에서 `1`을 뽑아서 함수의 `id` 변수에 넣어달라는 의미

* `@Query("name")`

  * 주소창 끝에 물음표로 붙어오는 검색어, 예를 들어 `/users?name=철수`에서 `철수`를 뽑아서 넘겨달라는 의미

---

#### 3. 설명서 작성용 포스트잇

“비서야, 네가 알아서 API 설명서(Swagger)를 만들 때, 이 내용은 꼭 이렇게 적어줘!”

* `@Tags("Users")`

  * 설명서에서 이 기능을 Users, 즉 사용자 관련 기능 카테고리로 묶어서 분류해 달라는 의미

* `@Summary("회원가입 기능입니다")`

  * 설명서 제목 옆에 짧게 이 기능이 무엇인지 한 줄로 적어달라는 의미

* `@SuccessResponse("200", "가입 성공")`

  * 이 기능이 성공적으로 끝나면 어떤 응답이 나가는지 설명서에 미리 적어달라는 의미

---

#### 4. 출입 통제 포스트잇

“비서야, 여기는 아무나 못 들어와. 출입증 검사 먼저 해!”

* `@Security("jwt")`

  * 이 함수를 실행하려면 사용자가 유효한 로그인 토큰(JWT)을 가지고 있는지 보안 미들웨어를 통해 먼저 확인하라는 의미
  * 토큰이 없으면 바로 차단

---

### 3-5. 검증 레이어(Validation)

Routes 레이어는 요청 데이터가 데코레이터에서 정의한 타입과 맞는지 런타임에 검증합니다.

검사 대상은 다음과 같습니다.

* Body
* Query
* Path

원래 Express는 사용자가 보낸 데이터가 숫자인지 문자열인지 무조건 통과시킬 수 있습니다.

하지만 TSOA가 만들어낸 Routes 레이어는 정의해둔 DTO 규격을 기준으로 사용자가 보낸 데이터를 먼저 검사합니다.

만약 DTO와 맞지 않는 데이터가 들어오면 컨트롤러에 넘기기 전에 `400 Bad Request` 에러 응답을 보냅니다.

즉, Routes 레이어는 입구 경호원 역할을 합니다.

개발자는 데이터가 이상할까 봐 걱정하는 코드를 줄일 수 있습니다.

---

### 3-6. 보안 및 미들웨어 통합

Routes 레이어는 Security 레이어를 관리하여 `tsoa.json` 설정에 따라 보안 미들웨어를 연동합니다.

보안 미들웨어는 사용자가 로그인한 VIP 고객이 맞는지 토큰, 즉 출입증을 검사하는 작업자입니다.

동작 흐름은 다음과 같습니다.

1. 코드에 `@Security("jwt")` 같은 포스트잇을 붙여둠
2. Routes 레이어는 “이 요청은 출입증 검사가 필수구나!”라고 인식
3. 사용자의 요청이 들어왔을 때, 일반 컨트롤러로 보내기 전에 자동으로 출입증 검사소, 즉 보안 미들웨어를 먼저 거치도록 길을 설계

---

### 3-7. 엔드포인트 연결

엔드포인트는 사용자, 프론트엔드 등이 서버에 접근하기 위해 두드리는 최종 목적지의 문, 즉 URL 주소입니다.

예시는 다음과 같습니다.

```txt
https://내사이트.com/api/v1/users/signup
```

사용자의 요청이 데이터 타입 검사와 보안 검사를 모두 무사히 통과했다면, Routes 레이어는 다음과 같이 동작합니다.

“모든 검사가 끝났습니다. 이제 진짜 작업을 시작하세요!”

그리고 정확히 그 요청을 처리해야 할 컨트롤러 안의 특정 함수에게 데이터를 넘겨줍니다.

---

### 4. TSOA의 핵심: Routes 레이어(`routes.ts`)

TSOA 명령어인 `tsoa routes`를 치면 `routes.ts` 파일이 생성됩니다.

이 파일은 컨트롤러와 Express를 연결하는 레이어입니다.

Routes 레이어의 4가지 핵심 역할은 다음과 같습니다.

1. **자동 라우팅 생성**

   * 개발자가 붙여둔 `@` 데코레이터를 분석해 복잡한 Express 라우팅 코드를 대신 작성합니다.

2. **검증 레이어(Runtime Validation)**

   * 원래 Express는 사용자가 엉뚱한 데이터, 예를 들어 나이에 문자열을 입력해도 일단 통과시킵니다.
   * 하지만 Routes 레이어는 입구 경호원 역할을 하여 DTO와 맞지 않는 데이터가 들어오면 컨트롤러에 닿기도 전에 `400 Bad Request`로 차단합니다.

3. **보안 및 미들웨어 통합**

   * `@Security`나 `@Middlewares` 포스트잇을 읽고, 컨트롤러 실행 전에 해당 미들웨어를 먼저 거치도록 길을 설계합니다.

4. **엔드포인트 연결**

   * 데이터 검증과 보안 검사를 모두 무사히 통과한 안전한 요청만을 실제 컨트롤러 메서드, 즉 최종 목적지로 넘겨줍니다.

</br>
---

# 🚀 [week7 개인적인 정리본]

---
## 1. 👾 tsoa 이론 정리
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
---
## 2. API 응답 통일과 에러 핸들링
---

### 1. API 응답을 통일해야 하는 이유

기존 API 응답은 다음과 같이 API마다 다른 형태로 내려올 수 있습니다.

```json
{
  "result": {
    "email": "test@example.com",
    "name": "엘빈",
    "preferCategory": ["과일", "생선"]
  }
}
```

API마다 응답 구조가 다르면 프론트엔드에서 처리하기 어려워집니다.
따라서 성공 응답과 실패 응답의 형태를 미리 정해두고, 모든 API가 같은 형식으로 응답하도록 통일하는 것이 좋습니다.

---

### 2. 공통 응답 형식

성공 응답은 다음과 같은 형태로 통일합니다.

```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": {
    ...
  }
}
```

실패 응답은 다음과 같은 형태로 통일합니다.

```json
{
  "resultType": "FAIL",
  "error": {
    "errorCode": "U001",
    "reason": "오류 원인",
    "data": {
      ...
    }
  },
  "success": null
}
```

각 필드의 의미는 다음과 같습니다.

* `resultType`: 요청 성공 여부
* `error`: 실패한 경우의 에러 정보
* `errorCode`: 에러를 구분하기 위한 코드
* `reason`: 에러 발생 이유
* `data`: 에러와 관련된 추가 데이터
* `success`: 성공한 경우의 실제 응답 데이터

---

### 3. 성공 응답 처리

TSOA를 사용하면 최종 응답을 TSOA가 담당하기 때문에, Express 미들웨어만으로 모든 성공 응답을 통일하기 어렵습니다.

그래서 성공 응답은 별도의 Wrapper 함수를 만들어 처리합니다.

```ts
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
```

컨트롤러에서는 다음과 같이 반환값을 `success()`로 감싸줍니다.

```ts
const user = await userSignUp(body);
return success(user);
```

이렇게 하면 실제 응답 데이터가 항상 `success` 안에 담겨 내려갑니다.

---

### 4. 실패 응답 처리

실패 응답은 전역 에러 처리 미들웨어를 통해 통일할 수 있습니다.

다만 기본 `Error` 객체에는 `errorCode`, `statusCode`, `data` 같은 속성이 없기 때문에, 커스텀 에러 클래스를 만들어 사용합니다.

```ts
export class AppError extends Error {
  public readonly errorCode: string;
  public readonly statusCode: number;
  public readonly data?: unknown;

  constructor(params: {
    errorCode: string;
    message: string;
    statusCode: number;
    data?: unknown;
  }) {
    super(params.message);
    this.errorCode = params.errorCode;
    this.statusCode = params.statusCode;
    this.data = params.data;
  }
}
```

예를 들어 이메일 중복 에러는 다음과 같이 따로 만들 수 있습니다.

```ts
export class DuplicateUserEmailError extends AppError {
  constructor(message: string, data?: unknown) {
    super({
      errorCode: "U001",
      statusCode: 409,
      message,
      data,
    });
  }
}
```

서비스 로직에서는 에러 상황이 발생했을 때 이 커스텀 에러를 던집니다.

```ts
if (joinUserId === null) {
  throw new DuplicateUserEmailError("이미 존재하는 이메일입니다.", data);
}
```

그러면 전역 에러 처리 미들웨어에서 이 에러를 받아 공통 실패 응답 형태로 변환합니다.

---

### 5. 에러 코드를 분리하는 이유

에러 코드를 분리하면 프론트엔드에서 오류 상황을 더 명확하게 처리할 수 있습니다.

예를 들어 모든 오류가 단순히 `"unknown"`으로 내려오면, 프론트엔드는 사용자에게 “서버 오류가 발생했습니다.” 정도의 메시지만 보여줄 수 있습니다.

하지만 에러 코드가 구체적으로 내려오면 다음과 같이 상황별 처리가 가능합니다.

* `U001`: 이메일 중복
* `U002`: 비밀번호 규칙 위반

즉, 에러 코드를 분리하면 클라이언트에서 오류를 구분하기 쉽고, 사용자에게 더 구체적인 안내를 제공할 수 있습니다.

---

### 정리

API 응답 통일은 프론트엔드와 백엔드가 일관된 방식으로 통신하기 위해 필요합니다.

TSOA에서는 성공 응답을 `success()` 같은 Wrapper 함수로 감싸서 반환하고, 실패 응답은 `AppError` 기반 커스텀 에러와 전역 에러 처리 미들웨어를 통해 통일할 수 있습니다.

결과적으로 API 응답 구조가 일정해지고, 에러 상황도 더 명확하게 관리할 수 있습니다.
