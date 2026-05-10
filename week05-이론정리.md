# TypeScript & Node.js 핵심 개념 정리

이 문서는 UMC 프로젝트의 실제 코드를 기반으로 7가지 핵심 개념을 설명합니다.

---

## 1. 환경 변수 (Environment Variables)

### 📖 이론
환경 변수는 **민감한 정보(비밀번호, API 키, DB 정보 등)를 소스 코드에 하드코딩하지 않고 외부에서 관리**하는 방식입니다.

- **보안**: 비밀번호를 코드에 노출시키지 않음
- **유연성**: 개발/테스트/운영 환경별로 다른 설정 사용 가능
- **`.env` 파일**: 환경 변수를 저장하는 파일 (git에 푸시하지 않음)
- **`dotenv` 패키지**: `.env` 파일의 변수를 `process.env`에 로드

### 💻 프로젝트 예시

**`.env` 파일 (저장소에 커밋 안 함)**
```
DB_HOST=localhost
DB_USER=root
DB_PORT=3306
DB_NAME=umc_10th
DB_PASSWORD=mypassword
PORT=3000
```

**`src/db.config.ts` - 환경 변수 사용**
```typescript
import dotenv from "dotenv";
dotenv.config(); // .env 파일 로드

import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",        // 환경 변수 또는 기본값
  user: process.env.DB_USER || "root",
  port: parseInt(process.env.DB_PORT || "3306"),   // 문자열을 숫자로 변환
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
```

**`src/index.ts` - 환경 변수로 포트 설정**
```typescript
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

### ✨ 장점
- 민감한 정보 보호
- 배포 환경에 따른 자동 설정
- 코드 재사용성 증대

---

## 2. CORS (Cross-Origin Resource Sharing)

### 📖 이론
CORS는 **웹 애플리케이션이 다른 도메인의 리소스에 접근할 수 있도록 허락하는 메커니즘**입니다.

- **Same-Origin Policy**: 브라우저는 기본적으로 다른 도메인의 요청을 차단
- **예시**: `http://localhost:3000`에서 `http://localhost:5000`으로 요청하는 경우 차단됨
- **CORS 해결**: 서버가 특정 도메인의 요청을 허용한다고 응답하면 가능
- **`cors` 미들웨어**: Express에서 CORS를 쉽게 설정할 수 있게 해줌

### 💻 프로젝트 예시

**`src/index.ts` - CORS 미들웨어 사용**
```typescript
import cors from "cors";

const app = express();

// 모든 도메인의 요청 허용 (기본 설정)
app.use(cors());

// 또는 특정 도메인만 허용
app.use(cors({
  origin: "http://localhost:3000",  // 특정 도메인만 허용
  credentials: true                  // 쿠키 포함 요청 허용
}));
```

### 🔄 동작 흐름
```
클라이언트 (브라우저) --- OPTIONS 요청 ---> 서버
                                          ↓
                                  CORS 헤더 확인
                                          ↓
클라이언트 (브라우저) <--- 허용/거부 응답 --- 서버
                                          ↓
                        실제 요청 (GET, POST 등) 진행
```

---

## 3. DB Connection & Connection Pool

### 📖 이론

#### **DB Connection (데이터베이스 연결)**
데이터베이스와 애플리케이션 간의 통신 채널입니다.
- 매번 쿼리를 실행할 때마다 새로운 연결을 만들고 닫으면 **성능 저하**
- 연결 생성에는 시간과 리소스가 소요됨

#### **Connection Pool (연결 풀)**
미리 만들어놓은 연결들을 **재사용하는 방식**입니다.
- 필요할 때 풀에서 연결을 빌려다가 사용 후 반환
- 반복적인 연결 생성/해제 오버헤드 제거
- 동시 요청 처리 능력 향상

### 💻 프로젝트 예시

**`src/db.config.ts` - Connection Pool 생성**
```typescript
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  port: parseInt(process.env.DB_PORT || "3306"),
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  
  waitForConnections: true,        // 연결을 기다릴지 여부
  connectionLimit: 10,             // 최대 10개의 연결 유지
  queueLimit: 0,                   // 대기열 제한 (0 = 무제한)
});
```

**`src/modules/stores/repositories/store.repository.ts` - Connection Pool 사용**
```typescript
import { pool } from "../../../db.config.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const getStoreById = async (storeId: number) => {
  // 1. 풀에서 연결 가져오기
  const conn = await pool.getConnection();

  try {
    // 2. 쿼리 실행
    const [store] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM store WHERE id = ?`,
      [storeId]
    );

    return store[0] || null;
  } finally {
    // 3. 연결을 풀에 반환 (중요!)
    conn.release();
  }
};

export const addReview = async (
  userId: number,
  storeId: number,
  body: string,
  score: number
) => {
  const conn = await pool.getConnection();

  try {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO review (user_id, store_id, body, score)
       VALUES (?, ?, ?, ?)`,
      [userId, storeId, body, score]
    );

    return result.insertId;
  } finally {
    conn.release();  // 반드시 반환!
  }
};
```

### 📊 Connection Pool 동작 원리
```
요청 1 ---> [연결 1 (사용 중)]
요청 2 ---> [연결 2 (사용 중)]
요청 3 ---> [연결 3 (사용 중)]
요청 4 ---> [연결 4 (대기 중)]  <-- 반환될 때까지 대기
            [연결 5 (대기 중)]
            ...
            [연결 10 (대기 중)]
```

### ✨ 장점
- **성능 향상**: 연결 생성 오버헤드 제거
- **리소스 효율**: 일정한 수의 연결만 유지
- **안정성**: 동시 요청 처리 능력 향상

---

## 4. Callback & Promise

### 📖 Callback (콜백)

#### 이론
**Callback**은 **다른 함수의 인자로 넘겨주는 함수**입니다. 어떤 작업이 완료된 후에 실행할 코드를 지정하는 방식입니다.

- **비동기 작업 완료 후 호출**: 특정 작업이 끝나면 콜백 함수 실행
- **제어의 역전**: 함수 호출 시점을 내가 제어할 수 없음
- **콜백 지옥**: 중첩이 많아지면 코드 가독성 저하

#### 💻 Callback 예시

**Callback 없이 작성 (동기식 - 느림)**
```typescript
// ❌ 이렇게 하면 안 됨 - 블로킹 발생
function getUser(userId: number) {
  // 3초 대기... (DB 쿼리)
  return { id: userId, name: "John" };
}

const user = getUser(1);  // 3초 기다림 - 이 동안 다른 요청 처리 불가
console.log(user);
```

**Callback으로 작성 (비동기)**
```typescript
// ✅ Callback 사용
function getUser(userId: number, callback: (user: any) => void) {
  // 비동기 작업 (예: setTimeout, DB 쿼리)
  setTimeout(() => {
    const user = { id: userId, name: "John" };
    callback(user);  // 작업 완료 후 콜백 함수 호출
  }, 3000);
}

getUser(1, (user) => {
  console.log(user);  // 3초 후 출력
});

console.log("기다리는 중...");  // 먼저 출력됨
```

**콜백 지옥 (Callback Hell) - 가독성 최악**
```typescript
getUser(1, (user) => {
  getPreferences(user.id, (prefs) => {
    getStores(prefs[0], (stores) => {
      getReviews(stores[0].id, (reviews) => {
        getScores(reviews[0].id, (scores) => {
          // 😱 너무 깊음!
          console.log(scores);
        });
      });
    });
  });
});
```

---

### 📖 Promise (프로미스)

#### 이론
**Promise**는 **비동기 작업의 결과(성공/실패)를 나중에 처리하겠다는 약속**입니다.

- **3가지 상태**:
  - `pending`: 작업 진행 중
  - `fulfilled`: 작업 성공
  - `rejected`: 작업 실패
  
- **Callback 지옥 해결**: `.then()` 체이닝으로 가독성 향상
- **에러 처리**: `.catch()`로 한 번에 처리 가능

#### 💻 Promise 기본

**Promise 생성**
```typescript
// 1. Promise 객체 생성
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    
    if (success) {
      resolve("성공!");  // ✅ fulfilled 상태
    } else {
      reject("실패!");   // ❌ rejected 상태
    }
  }, 1000);
});

// 2. Promise 처리
myPromise
  .then((result) => {
    console.log(result);  // "성공!" 출력
  })
  .catch((error) => {
    console.error(error);  // 에러 처리
  });
```

**Promise 체이닝 - Callback Hell 해결**
```typescript
// 깔끔한 Promise 체이닝
getUser(1)
  .then((user) => {
    console.log("사용자:", user);
    return getPreferences(user.id);  // 다음 Promise 반환
  })
  .then((prefs) => {
    console.log("선호도:", prefs);
    return getStores(prefs[0]);
  })
  .then((stores) => {
    console.log("가게:", stores);
  })
  .catch((error) => {
    console.error("에러 발생:", error);  // 어디서든 에러 처리
  });
```

**Promise 병렬 처리**
```typescript
// 여러 Promise를 동시에 처리
Promise.all([
  getUser(1),
  getStores(),
  getPreferences()
])
  .then(([user, stores, prefs]) => {
    console.log(user, stores, prefs);
  })
  .catch((error) => {
    console.error("하나라도 실패하면:", error);
  });
```

#### 💻 프로젝트 예시 (Promise 패턴)

**Repository에서 Promise 반환**
```typescript
export const getStoreById = (storeId: number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const conn = await pool.getConnection();
    
    try {
      const [store] = await conn.query<RowDataPacket[]>(
        `SELECT * FROM store WHERE id = ?`,
        [storeId]
      );
      
      resolve(store[0] || null);  // ✅ 성공
    } catch (error) {
      reject(error);  // ❌ 실패
    } finally {
      conn.release();
    }
  });
};

// 사용할 때
getStoreById(1)
  .then((store) => {
    console.log("가게:", store);
  })
  .catch((error) => {
    console.error("오류:", error);
  });
```

---

### 📊 Callback vs Promise vs async/await 비교

```typescript
// 1️⃣ CALLBACK 방식 (옛날)
function getUserCallback(id: number, callback: Function) {
  setTimeout(() => {
    callback({ id, name: "John" });
  }, 1000);
}

getUserCallback(1, (user) => {
  console.log(user);
});

// 2️⃣ PROMISE 방식 (중간)
function getUserPromise(id: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "John" });
    }, 1000);
  });
}

getUserPromise(1)
  .then((user) => console.log(user));

// 3️⃣ ASYNC/AWAIT 방식 (현대적) ⭐️ 가장 깔끔!
async function getUserAsync(id: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "John" });
    }, 1000);
  });
}

async function main() {
  const user = await getUserAsync(1);
  console.log(user);  // 마치 동기식처럼 읽힘
}

main();
```

### 📊 실행 순서 비교

**Callback**
```
① getUserCallback() 호출
② setTimeout 등록
③ 콜백 함수를 나중에 실행하라고 등록
④ 즉시 반환 (다음 코드 실행)
⑤ 1초 후 콜백 함수 실행
```

**Promise**
```
① getUserPromise() 호출
② Promise 객체 반환 (pending 상태)
③ .then() 등록
④ 즉시 반환 (다음 코드 실행)
⑤ 1초 후 resolve() 호출 → fulfilled 상태 → .then() 실행
```

**async/await**
```
① async function 호출
② await로 Promise 완료 대기
③ Promise resolve 될 때까지 여기서 멈춤
④ 값 반환받고 다음 코드 실행
(마치 동기식처럼 보이지만 내부적으로는 Promise)
```

---

## 5. 비동기 (async / await)

### 📖 이론
JavaScript는 **단일 스레드**로 실행됩니다. 비동기 처리는 시간이 걸리는 작업(DB 쿼리, 파일 읽기, HTTP 요청)을 **논블로킹 방식**으로 처리합니다.

#### **async 키워드**
- 함수가 **항상 Promise를 반환**하도록 함

#### **await 키워드**
- Promise가 **완료될 때까지 대기**
- `async` 함수 내에서만 사용 가능
- 코드를 **동기식처럼** 보이게 만들어 가독성 향상

### 💻 프로젝트 예시

**`src/modules/users/services/user.service.ts` - async/await 사용**
```typescript
export const userSignUp = async (data: UserSignUpRequest) => {
  // 1. 비동기 작업: 비밀번호 해싱 (시간 소요)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  // 2. 비동기 작업: 데이터베이스에 사용자 추가
  const joinUserId = await addUser({
    email: data.email,
    name: data.name,
    gender: data.gender,
    birth: new Date(data.birth),
    address: data.address,
    password: hashedPassword,
    phoneNumber: data.phoneNumber,
  });

  if (joinUserId === null) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  // 3. 비동기 작업: 선호 카테고리 추가 (반복)
  for (const preference of data.preferences) {
    await setPreference(joinUserId, preference);
  }

  // 4. 비동기 작업: 사용자 정보 조회
  const user = await getUser(joinUserId);
  const preferences = await getUserPreferencesByUserId(joinUserId);

  return responseFromUser({ user, preferences });
};
```

**`src/modules/users/controllers/user.controller.ts` - async 함수**
```typescript
export const handleUserSignUp = async (req: Request, res: Response) => {
  console.log("회원가입을 요청했습니다!");
  
  // await으로 비동기 작업 완료 대기
  const user = await userSignUp(bodyToUser(req.body as UserSignUpRequest));
  
  // 결과를 클라이언트에 응답
  res.status(StatusCodes.OK).json({ result: user });
};
```

**`src/modules/stores/repositories/store.repository.ts` - async 함수**
```typescript
export const getStoreById = async (storeId: number) => {
  const conn = await pool.getConnection();  // 연결 획득 대기

  try {
    const [store] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM store WHERE id = ?`,
      [storeId]
    );  // 쿼리 완료 대기

    return store[0] || null;
  } finally {
    conn.release();
  }
};
```

### 🔄 Callback vs Promise vs async/await

**콜백 (옛날 방식) - 콜백 지옥**
```typescript
function getUserAndPreferences(userId, callback) {
  getUser(userId, function(err, user) {
    if (err) {
      callback(err);
    } else {
      getPreferences(userId, function(err, prefs) {
        if (err) {
          callback(err);
        } else {
          callback(null, { user, prefs });
        }
      });
    }
  });
}
```

**Promise (중간 단계)**
```typescript
function getUserAndPreferences(userId) {
  return getUser(userId)
    .then(user => {
      return getPreferences(userId).then(prefs => ({user, prefs}));
    })
    .catch(err => {
      console.error(err);
    });
}
```

**async/await (현대적 방식) - 가장 깔끔함**
```typescript
async function getUserAndPreferences(userId) {
  try {
    const user = await getUser(userId);
    const prefs = await getPreferences(userId);
    return { user, prefs };
  } catch (err) {
    console.error(err);
  }
}
```

---

## 6. try/catch/finally

### 📖 이론
에러 처리 메커니즘입니다.

- **`try`**: 실행할 코드 (에러가 발생할 수 있는 부분)
- **`catch`**: 에러 발생 시 실행할 코드
- **`finally`**: 에러 발생 여부와 관계없이 항상 실행할 코드

### 💻 프로젝트 예시

**`src/modules/stores/controllers/store.controller.ts` - try/catch 사용**
```typescript
export const handleAddReview = async (req: Request, res: Response) => {
  try {
    // ✅ 정상 경로: 리뷰 생성
    console.log("리뷰 add 요청:", req.body);
    
    const review = await createReview(bodyToReview(req.body));
    
    res.status(StatusCodes.OK).json({
      result: review,
    });
  } catch (err) {
    // ❌ 에러 경로: 에러 메시지 클라이언트에 전송
    res.status(StatusCodes.BAD_REQUEST).json({
      message: (err as Error).message,
    });
  }
};

export const handleAddMission = async (req: Request, res: Response) => {
  try {
    console.log("미션 추가 요청:", req.body);
    const mission = await createMission(bodyToMission(req.body));
    res.status(StatusCodes.OK).json({
      result: mission,
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: (err as Error).message,
    });
  }
};
```

**`src/modules/stores/repositories/store.repository.ts` - finally 사용**
```typescript
export const getStoreById = async (storeId: number) => {
  const conn = await pool.getConnection();

  try {
    // 정상 경로
    const [store] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM store WHERE id = ?`,
      [storeId]
    );
    return store[0] || null;
  } finally {
    // 정상/에러 관계없이 항상 실행
    // 📌 중요: 연결을 반드시 반환해야 함!
    conn.release();
  }
};

export const addReview = async (
  userId: number,
  storeId: number,
  body: string,
  score: number
) => {
  const conn = await pool.getConnection();

  try {
    // 정상 경로
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO review (user_id, store_id, body, score)
       VALUES (?, ?, ?, ?)`,
      [userId, storeId, body, score]
    );
    return result.insertId;
  } finally {
    // 정상/에러 관계없이 연결 반환
    conn.release();
  }
};
```

### 🔄 에러 처리 흐름
```
try {
  ✅ 정상 실행 --> 결과 반환
  ❌ 에러 발생 --> catch 블록으로 이동
} catch (err) {
  에러 처리
} finally {
  항상 실행 (자원 정리)
}
```

### 📝 예외 상황 처리

**`src/modules/stores/services/store.service.ts` - 명시적 에러 발생**
```typescript
export const createReview = async (data: any) => {
  const store = await getStoreById(data.storeId);

  // 존재하지 않는 가게라면 에러 발생
  if (!store) {
    throw new Error("존재하지 않는 가게입니다.");  // ← catch에서 잡힘
  }

  const reviewId = await addReview(
    userId,
    data.storeId,
    data.body,
    data.score
  );

  return { reviewId, storeId: data.storeId };
};

export const challengeMission = async (data: any) => {
  const mission = await getMissionById(data.missionId);

  if (!mission) {
    throw new Error("존재하지 않는 미션입니다.");
  }

  const isAlreadyChallenging = await checkUserMissionExists(userId, data.missionId);

  if (isAlreadyChallenging) {
    throw new Error("이미 도전 중인 미션입니다.");  // 중복 도전 방지
  }

  const userMissionId = await addUserMission(userId, data.missionId);

  return {
    userMissionId,
    userId,
    missionId: data.missionId,
    status: "진행중",
  };
};
```

---

## 7. Interface (인터페이스)

### 📖 이론
**인터페이스**는 객체의 구조를 정의하는 TypeScript의 기능입니다.

- **타입 안정성**: 데이터의 형태를 명확하게 정의
- **자동 완성**: IDE에서 속성명 자동 제시
- **버그 방지**: 잘못된 타입 사용 시 컴파일 에러
- **선택적 속성**: `?` 키워드로 필수/선택 구분

### 💻 프로젝트 예시

**`src/modules/users/dtos/user.dto.ts` - Interface 정의**
```typescript
// 1. 회원가입 요청 데이터의 설계도
export interface UserSignUpRequest {
  email: string;                    // 필수
  password: string;                 // 필수
  name: string;                     // 필수
  gender: string;                   // 필수
  birth: Date;                      // 필수
  address?: string;                 // 선택 (? = optional)
  detailAddress?: string;           // 선택
  phoneNumber: string;              // 필수
  preferences: number[];            // 필수: 숫자 배열
}

// 2. 데이터베이스에서 조회한 사용자 객체의 형태
export interface UserEntity {
  id: number;
  email: string;
  name: string;
  gender: string;
  birth: Date;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  password: string;
}
```

**`src/modules/users/services/user.service.ts` - Interface 타입으로 사용**
```typescript
import { UserSignUpRequest } from "../dtos/user.dto.js";

// 함수의 매개변수 타입으로 인터페이스 사용
export const userSignUp = async (data: UserSignUpRequest) => {
  const saltRounds = 10;
  
  // data의 모든 속성이 타입 체크됨
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  const joinUserId = await addUser({
    email: data.email,        // ✅ 타입 체크
    name: data.name,          // ✅ 타입 체크
    gender: data.gender,      // ✅ 타입 체크
    birth: new Date(data.birth),
    address: data.address,
    phoneNumber: data.phoneNumber,
    password: hashedPassword,
  });

  if (joinUserId === null) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  for (const preference of data.preferences) {
    await setPreference(joinUserId, preference);
  }

  const user = await getUser(joinUserId);
  const preferences = await getUserPreferencesByUserId(joinUserId);

  return responseFromUser({ user, preferences });
};
```

**`src/modules/users/controllers/user.controller.ts` - Interface 타입 강제**
```typescript
export const handleUserSignUp = async (req: Request, res: Response) => {
  console.log("회원가입을 요청했습니다!");
  
  // bodyToUser 함수는 UserSignUpRequest 타입을 기대함
  const user = await userSignUp(
    bodyToUser(req.body as UserSignUpRequest)
  );
  
  res.status(StatusCodes.OK).json({ result: user });
};
```

### 📊 Interface 예시

**없이 작성한 경우 (위험)**
```typescript
// 타입 체크 없음 → 버그 가능성 높음
function createUser(data: any) {
  console.log(data.emai);  // 오타! ('email'이 아님)
                           // any 타입이라 컴파일 에러 없음
                           // 런타임에서 undefined 발생
}
```

**Interface로 작성한 경우 (안전)**
```typescript
interface UserRequest {
  email: string;
  name: string;
}

function createUser(data: UserRequest) {
  console.log(data.emai);  // ❌ TypeScript 컴파일 에러!
                           // 'emai' 속성이 없으므로 미리 발견
}
```

---

## 8. Type Assertion (as 키워드)

### 📖 이론
**Type Assertion**은 TypeScript에게 **"내가 이 값의 타입을 더 정확히 알고 있다"고 알려주는 것**입니다.

- **타입 캐스팅**: 한 타입을 다른 타입으로 강제 변환
- **`as` 키워드**: Type Assertion 문법
- **컴파일러 무시**: TypeScript의 타입 추론을 무시하고 개발자가 직접 지정
- **주의**: 잘못 사용하면 런타임 에러 발생 가능

### 💻 프로젝트 예시

**`src/modules/users/controllers/user.controller.ts` - req.body 타입 강제**
```typescript
import { UserSignUpRequest } from "../dtos/user.dto.js";

export const handleUserSignUp = async (req: Request, res: Response) => {
  console.log("회원가입을 요청했습니다!");

  // 1. 문제: req.body는 'any' 타입
  // 따라서 자동완성이나 타입 체크가 안 됨
  
  // 2. 해결: Type Assertion으로 타입 명시
  const user = await userSignUp(
    bodyToUser(req.body as UserSignUpRequest)
                     ↑
                  Type Assertion
  );

  res.status(StatusCodes.OK).json({ result: user });
};
```

**`src/modules/stores/controllers/store.controller.ts` - Error 타입 강제**
```typescript
export const handleAddReview = async (req: Request, res: Response) => {
  try {
    console.log("리뷰 add 요청:", req.body);
    const review = await createReview(bodyToReview(req.body));
    res.status(StatusCodes.OK).json({
      result: review,
    });
  } catch (err) {
    // Error 타입 강제 (err은 unknown 타입이므로)
    res.status(StatusCodes.BAD_REQUEST).json({
      message: (err as Error).message,  // ← Type Assertion
                 ↑
            Error 타입으로 강제
    });
  }
};
```

**`src/modules/stores/repositories/store.repository.ts` - mysql2 타입 강제**
```typescript
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const getStoreById = async (storeId: number) => {
  const conn = await pool.getConnection();

  try {
    const [store] = await conn.query<RowDataPacket[]>(
                                    ↑ Type Assertion
      `SELECT * FROM store WHERE id = ?`,
      [storeId]
    );
    // RowDataPacket[]로 명시하면 IDE가 데이터 구조를 알 수 있음

    return store[0] || null;
  } finally {
    conn.release();
  }
};

export const addReview = async (
  userId: number,
  storeId: number,
  body: string,
  score: number
) => {
  const conn = await pool.getConnection();

  try {
    const [result] = await conn.query<ResultSetHeader>(
                                      ↑ Type Assertion
      `INSERT INTO review (user_id, store_id, body, score)
       VALUES (?, ?, ?, ?)`,
      [userId, storeId, body, score]
    );
    // ResultSetHeader로 명시하면 insertId 속성에 접근 가능

    return result.insertId;
  } finally {
    conn.release();
  }
};
```

### 📊 Type Assertion 패턴

**패턴 1: any → 구체적 타입**
```typescript
// ❌ 나쁜 예
const user: any = {
  name: "John",
  age: 30
};
console.log(user.nam);  // 오타! 컴파일 에러 없음

// ✅ 좋은 예
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "John",
  age: 30
};
console.log(user.nam);  // ❌ TypeScript 컴파일 에러!
```

**패턴 2: 에러 객체 처리**
```typescript
// ❌ 문제
try {
  // ...
} catch (err) {
  console.log(err.message);  // err은 unknown 타입
}

// ✅ 해결
try {
  // ...
} catch (err) {
  console.log((err as Error).message);  // Error 타입으로 강제
}
```

**패턴 3: 제네릭 타입**
```typescript
// mysql2 쿼리 결과 타입 지정
const [rows] = await conn.query<RowDataPacket[]>(
  `SELECT * FROM users`
);

const [result] = await conn.query<ResultSetHeader>(
  `INSERT INTO users VALUES (...)`
);
```

### ⚠️ Type Assertion 주의사항

```typescript
// ❌ 위험한 사용 (타입 불일치)
const num: number = "hello" as number;  // 컴파일 성공, 런타임 실패

// ✅ 안전한 사용 (타입 호환)
const str: string = 123 as unknown as string;  // 명시적으로 변환

// ✅ 더 나은 방법 (타입 좁히기)
if (typeof value === 'string') {
  const str = value;  // 자동으로 string 타입 추론
}
```

---

## 📌 전체 흐름 연결

```
클라이언트 (REST 요청)
         ↓
    [index.ts]
    ├─ 환경 변수 로드 (.env 파일)
    ├─ CORS 미들웨어 설정
    └─ API 라우트 연결
         ↓
    [Controller] - (async/await)
    ├─ Type Assertion으로 req.body 타입 강제
    ├─ try/catch로 에러 처리
    └─ Service 호출
         ↓
    [Service] - (async/await)
    ├─ Interface로 데이터 검증
    ├─ 비즈니스 로직 처리
    └─ Repository 호출
         ↓
    [Repository] - (async/await, Connection Pool)
    ├─ DB Connection 획득
    ├─ try/finally로 연결 관리
    └─ 쿼리 실행
         ↓
    [MySQL Database]
```

---

## 🎯 핵심 정리

| 개념 | 역할 | 프로젝트 예시 |
|------|------|---------|
| **환경 변수** | 민감한 설정값 관리 | DB 연결 정보, PORT |
| **CORS** | 다른 도메인 요청 허용 | `app.use(cors())` |
| **Connection Pool** | DB 연결 재사용 | `pool.getConnection()` |
| **Callback** | 비동기 작업 완료 후 호출 | `getUser(id, callback)` |
| **Promise** | 비동기 작업 결과 약속 | `getUser(id).then()` |
| **async/await** | 동기식처럼 보이는 비동기 | `await userSignUp()` |
| **try/catch/finally** | 에러 처리 및 자원 정리 | `finally { conn.release() }` |
| **Interface** | 타입 안정성 | `UserSignUpRequest` |
| **Type Assertion** | 타입 강제 지정 | `req.body as UserSignUpRequest` |

