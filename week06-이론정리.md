
---

# 🚀 [week6 핵심 keyword] ORM & 페이지네이션 핵심 개념

작성하신 마크다운 문서를 꼼꼼히 읽어보았습니다. 전체적인 흐름이 아주 논리적이고, 실무에서 헷갈리기 쉬운 부분(Params vs Query vs Body, DTO의 필요성 등)을 직관적인 예시와 함께 잘 정리하셨네요! 기술 블로그나 개인 노트를 작성하실 때 이대로 활용하셔도 손색이 없을 만큼 훌륭합니다.

요청하신 대로 문서 맨 위에 추가할 **ORM 및 페이지네이션 요약본**을 먼저 작성해 드리고, 이어서 **문서 내 중복 내용에 대한 피드백**을 정리해 드리겠습니다.

---

## 🚀 [추가 요약] ORM & 페이지네이션 핵심 개념

### 1. ORM & Prisma 핵심 요약

* **Connection Pool 자동 관리:** 

    Prisma Client는 내부적으로 Connection Pool을 자동 생성하고 관리합니다. 개발자가 수동으로 연결을 맺고 끊을(`release`) 필요가 없어 연결 누수(Leak)를 원천 차단합니다.
* **마이그레이션(Migration) 관리:** 

    `prisma migrate dev` 명령어를 통해 `schema.prisma`의 변경 사항을 추적하고, 이를 실제 DB에 반영하기 위한 SQL 스크립트 버전(히스토리)을 자동 생성하여 안전하게 DB 스키마를 동기화합니다.
* **ORM(Prisma)의 장단점:**
    * **👍 장점:** 완벽한 타입 추론(TypeScript 친화적), 개발 생산성 향상, DB 종류에 종속되지 않음, SQL Injection 방지.
    * **👎 단점:** 매우 복잡한 통계용 쿼리나 다중 서브 쿼리 작성 시 한계가 있음(이 경우 Raw SQL 필요), 초기 쿼리 성능 최적화(N+1 등)를 위한 학습 필요.


* **다른 대표적인 Node.js ORM:**
    * **TypeORM:** 객체 지향적이고 데코레이터(`@`)를 적극 활용. (NestJS에서 기본 채택)
    * **Sequelize:** 오래되고 방대한 생태계를 가진 전통적인 Promise 기반 ORM.

</br>

### 2. 실무 API의 페이지네이션 사례

* **GitHub REST API (Offset & Link 방식):** 주로 `page`와 `per_page` 파라미터를 사용합니다. 응답 헤더(Header)의 `Link`에 다음, 이전, 마지막 페이지의 URL을 통째로 내려주어 클라이언트가 편리하게 네비게이션할 수 있도록 돕습니다.
* **Notion API (Cursor 방식):** 대용량 데이터 처리에 유리한 **Cursor-based Pagination**을 엄격하게 사용합니다. 응답 객체에 `next_cursor` 값과 `has_more` (다음 페이지 존재 여부) boolean 값을 내려주어, 다음 요청 시 해당 커서를 사용하게 합니다. (현재 작성하신 코드의 구조와 일치합니다!)

---

# 1 계층 구조 정리: Controller(DTO) → Service → Repository ↔ DTO

## 📊 계층 구조도

```text
사용자 요청 (HTTP)
         ↓
    🎮 Controller (핸들러) + 📀 DTO로 활용해서 Service 로직 호출
         ↓
    🧠 Service (비즈니스 로직) + 📀 DTO로 형태 변환해서 리턴
         ↓
    💾 Repository (DB 접근)
         ↓
      Database

```

## 🔄 호출 순서 (실제 코드 기반)

### **1️⃣ Controller** → 요청 받음

```typescript
// user.controller.ts
export const handleUserSignUp = async (req: Request, res: Response) => {
    // ✅ 1단계: 클라이언트 요청 받음
    console.log("body:", req.body);
    
    // ✅ 2단계: Service 호출 (비즈니스 로직 위임)
    const user = await userSignUp(bodyToUser(req.body)); // 📀 DTO 형태
    
    // ✅ 3단계: 응답 반환
    res.status(StatusCodes.OK).json({ result: user });
};

```

### **2️⃣ DTO** → 데이터 변환 (Controller & Service 사이)

```typescript
// user.dto.ts
export interface UserSignUpRequest {
    email: string;
    password: string;
    name: string;
}

// 요청 데이터를 내부 포맷으로 변환
export const bodyToUser = (body: UserSignUpRequest) => {
    return {
        email: body.email,
        name: body.name,
        // ... 필요한 형태로 변환
    };
};

```

### **3️⃣ Service** → 비즈니스 로직 처리

```typescript
// user.service.ts
export const userSignUp = async (data: UserSignUpRequest) => { // 📀 DTO 형태
    // ✅ 비즈니스 로직 처리 (암호화, 검증 등)
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // ✅ Repository 호출해서 DB에 저장
    const joinUserId = await addUser({
        email: data.email,
        password: hashedPassword,
    });
    
    // ✅ 추가 처리 (preference 설정 등)
    for (const preference of data.preferences) {
        await setPreference(joinUserId, preference);
    }
    
    // ✅ DTO로 응답 형태 변환
    return responseFromUser({ user, preferences }); // 📀 DTO 형태
};

```

### **4️⃣ Repository** → DB 직접 접근

```typescript
// user.repository.ts
export const addUser = async (data: any): Promise<number | null> => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });
    
    if (existingUser) return null;
    
    const createdUser = await prisma.user.create({
        data: { /* ... */ }
    });
    
    return createdUser.id;
};

```

## 📋 각 계층의 역할 정리

| 계층 | 파일 | 역할 | 예시 |
| --- | --- | --- | --- |
| **Controller** | `*.controller.ts` | HTTP 요청 처리 & 응답 반환 | `handleUserSignUp()` - req.body 받아서 Service 호출 |
| **DTO** | `*.dto.ts` | 데이터 구조 정의 & 변환 | `bodyToUser()` - 클라이언트 요청 → 서버 포맷 변환 |
| **Service** | `*.service.ts` | 핵심 비즈니스 로직 | `userSignUp()` - 암호화, 검증, 여러 Repository 조합 |
| **Repository** | `*.repository.ts` | DB와 직접 상호작용 | `addUser()` - Prisma로 DB INSERT/SELECT |

---

## 🎁 DTO: 항상 필요한가? (필요할 때와 불필요할 때)

**DTO는 "데이터 변환/검증/필터링"을 담당합니다. 그런데 항상 필요한 건 아닙니다.**

### **DTO가 필요한 경우** ✅

#### **1️⃣ 타입 변환이 필요한 경우**

```typescript
export const bodyToMission = (body: AddMissionRequest) => {
  return {
    storeId: body.storeId,
    reward: body.reward,
    deadline: new Date(body.deadline),  // string → Date 변환 필수!
    missionSpec: body.missionSpec,
  };
};
// Service에서 사용: const mission = await createMission(bodyToMission(req.body));

```

#### **2️⃣ 데이터를 숨기거나 선택해야 하는 경우**

```typescript
export const responseFromUser = (user: any) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    // ❌ password는 빼기 (보안)
  };
};

```

#### **3️⃣ 검증이 필요한 경우**

```typescript
export const bodyToUser = (body: UserSignUpRequest) => {
  if (!body.email.includes('@')) throw new Error('유효한 이메일이 아닙니다');
  if (body.password.length < 8) throw new Error('비밀번호는 8자 이상이어야 합니다');
  return { ...body };
};

```

### **DTO가 불필요한 경우 (단순 Pass-through)** ❌

```typescript
// ❌ 의미 없는 DTO
export const bodyToChallengeMission = (body: ChallengeMissionRequest) => {
  return { missionId: body.missionId };  // 변환도, 필터도 없음
};

// ✅ 더 간단하고 올바른 방식 (그냥 직접 Service 호출)
const result = await challengeMission(req.body.missionId);

```

**결론**: 변환/검증/필터링이 있으면 DTO 쓰고, 없으면 그냥 전달!

---

# 2 SQL → ORM으로의 전환: 개념 이해

## 📚 SQL vs ORM의 개념 비교

### **SQL (Structured Query Language)**

* 데이터베이스에 직접 쿼리를 문자열로 작성.
* DB에 종속적이며, SQL Injection 위험과 타입 안전성이 없음.

```sql
SELECT * FROM user WHERE id = ?;
INSERT INTO user (email, name) VALUES (?, ?);

```

### **ORM (Object-Relational Mapping)**

* TypeScript/JavaScript 객체로 DB를 조작.
* ORM이 자동으로 SQL로 변환. 타입 안전성과 생산성 극대화.

```typescript
const user = await prisma.user.findUnique({ where: { id: userId } });
await prisma.user.create({ data: { email, name } });

```

## 🔀 코드 비교: SQL vs Prisma ORM

### **1️⃣ SELECT (조회)**

```typescript
// ❌ 예전 방식: Raw SQL
const [user] = await conn.query(`SELECT * FROM user WHERE id = ?`, [userId]);

// ✅ ORM 방식: Prisma
const user = await prisma.user.findUnique({ where: { id: userId } });

```

### **2️⃣ INSERT (데이터 생성)**

```typescript
// ❌ 예전 방식: Raw SQL
const [result] = await conn.query(
  `INSERT INTO user (email, name, password) VALUES (?, ?, ?)`, [email, name, hashedPassword]
);

// ✅ ORM 방식: Prisma
const createdUser = await prisma.user.create({
  data: { email, name, password: hashedPassword }
});

```

### **3️⃣ JOIN (관계 쿼리)**

```typescript
// ❌ 예전 방식: Raw SQL
const [reviews] = await conn.query(
  `SELECT ufc.id, fcl.name FROM user_favor_category ufc 
   JOIN food_category fcl ON ufc.food_category_id = fcl.id WHERE ufc.user_id = ?`, [userId]
);

// ✅ ORM 방식: Prisma
const preferences = await prisma.userFavorCategory.findMany({
  where: { userId: userId },
  include: { foodCategory: true }  // 자동으로 JOIN 처리!
});

```

### **4️⃣ 복합 조건 (WHERE + ORDER BY + LIMIT)**

```typescript
// ❌ 예전 방식: Raw SQL
const [reviews] = await conn.query(
  `SELECT * FROM review WHERE store_id = ? AND id > ? ORDER BY id ASC LIMIT 5`, [storeId, cursor]
);

// ✅ ORM 방식: Prisma
const reviews = await prisma.review.findMany({
  where: { storeId: storeId, id: { gt: cursor } },
  orderBy: { id: "asc" },
  take: 5
});

```

---

# 3 Prisma ORM 자주 쓰는 문법 정리

### **조회/생성/수정/삭제 메서드**

| 작업 | 메서드 예시 |
| --- | --- |
| **조회(READ)** | `findUnique()`, `findFirst()`, `findMany()` |
| **생성(CREATE)** | `create()`, `createMany()` |
| **수정(UPDATE)** | `update()`, `updateMany()`, `upsert()` |
| **삭제(DELETE)** | `delete()`, `deleteMany()` |

### **쿼리 옵션 (WHERE, SELECT, INCLUDE 등)**

#### **where** (SQL WHERE 절)

```typescript
await prisma.review.findMany({
  where: {
    storeId: 5,           
    score: { gte: 4 },    // >= 4
    id: { gt: 100 },      // > 100
    body: { contains: "맛있어" }  // LIKE '%맛있어%'
  }
});

```

#### **include** (JOIN 처리 - 연관 데이터 전체 포함)

```typescript
const reviews = await prisma.review.findMany({
  include: { store: true, user: true }
});

```

---

### 💡 [중요] 중첩 `select`를 활용한 정교한 JOIN (Nested Reads)

`include`를 쓰면 연관된 테이블의 '모든 컬럼'을 다 가져오기 때문에 데이터 낭비가 발생할 수 있습니다. 이를 방지하기 위해 **`select` 안에 또 `select`를 작성하여 꼭 필요한 컬럼만 JOIN** 할 수 있습니다.

```typescript
const result = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true, // User 정보 중 필요한 것만
    
    // JOIN: 연관된 Mission 데이터 중 원하는 컬럼과 조건만 설정
    mission: {
      select: {
        id: true,
        missionSpec: true,
        reward: true,
        deadline: true,
      },
      where: { id: { gt: BigInt(cursor) } }, // JOIN 안에서 필터링 가능
      orderBy: { id: "asc" },
      take: 5,
    },

    // JOIN: 연관된 Store 데이터 중 원하는 것만
    store: {
      select: { id: true, name: true }
    }
  }
});

```

이 방식은 SQL의 `SELECT a.id, b.name FROM JOIN ...` 과 완벽히 일치하며, DTO 응답 구조에 맞게 최적화하기 가장 좋은 실무 권장 패턴입니다.

---

### **타입 변환 및 성능 고려사항 (N+1 문제)**

#### **BigInt 변환**

Prisma는 큰 정수를 `BigInt`로 반환하므로, JSON 응답 시 Number 변환이 필요합니다. `Number(user.id)`

#### **N+1 쿼리 문제 해결**

```typescript
// ❌ 비효율적: users.length만큼 쿼리가 추가 실행됨
for (const user of users) {
  await prisma.userFavorCategory.findMany({ where: { userId: user.id } });
}

// ✅ 해결: include(또는 select)를 사용하여 1번의 쿼리로 처리
const users = await prisma.user.findMany({
  include: { userFavorCategory: true }
});

```

---

# 4 Connection Pool: SQL에서 필요했던 이유 & ORM이 해결한 방법

## 🤔 Pool이 뭐고 왜 필요했나?

**Pool**: DB 연결(Connection)을 미리 여러 개 만들어두고 재사용하는 방식. 매번 새로 만들면 느리고 서버 과부하가 걸립니다.

## 📚 SQL에서 Pool을 수동으로 관리

```typescript
export const addUser = async (data: any) => {
  const conn = await pool.getConnection();  // 🔵 받기
  try {
    const [result] = await conn.query('INSERT INTO user ...');
    return result.insertId;
  } finally {
    conn.release();  // 🔴 반환 (안 하면 누수!)
  }
};

```

**문제점**: 매번 try-finally 작성 + `conn.release()` 필수. 실수하면 Connection 누수로 장애 발생.

## 🚀 ORM (Prisma): Pool을 자동으로 관리

```typescript
export const addUser = async (data: any) => {
  const createdUser = await prisma.user.create({ data: { ...data } });
  return createdUser.id; // ✅ Connection 자동 획득 및 반환됨
};

```

**결론**: Prisma는 Pool의 복잡성을 숨기고 자동화하여 개발자가 비즈니스 로직에만 집중하게 해줍니다.

---

# 5 API 요청 처리: params, query, body & parseInt 정리

## 📊 3가지 데이터 전송 방식

| 항목 | Params | Query | Body |
| --- | --- | --- | --- |
| **위치** | URL 경로 (`/stores/123`) | `?` 뒤 (`?cursor=100`) | 메시지 본문 |
| **타입** | **항상 문자열** ⚠️ | **항상 문자열** ⚠️ | **JSON (타입 유지)** ✅ |
| **파싱** | `parseInt()` 필수 | `parseInt()` 필수 | 불필요 |
| **용도** | 특정 자원 식별 (ID) | 필터, 옵션, 페이지네이션 | 데이터 생성/수정 |

## 💡 실제 코드 예시

### **예시 1: GET 요청 (Params & Query)**

```typescript
// GET /api/v1/stores/123/reviews?cursor=100
export const handleListStoreReviews = async (req, res) => {
  // Params/Query는 문자열이므로 숫자로 쓰려면 Controller에서 변환 필수!
  const storeId = parseInt(req.params.storeId as string, 10);  // "123" → 123
  
  const cursor = typeof req.query.cursor === "string"
      ? parseInt(req.query.cursor, 10)
      : 0;
  
  const reviews = await listStoreReviews(storeId, cursor);
  res.status(200).json(reviews);
};

```

### **예시 2: POST 요청 (Body)**

```typescript
// POST /api/v1/stores/reviews
// Body: { "storeId": 123, "body": "좋아요", "score": 5 }
export const handleAddReview = async (req, res) => {
  // Body는 JSON 타입이 유지되므로 parseInt 불필요
  const storeId = req.body.storeId;      // 123 (숫자)
  
  // 타입 변환/검증이 필요하므로 DTO 적용
  const review = await createReview(bodyToReview(req.body));
  res.status(200).json({ result: review });
};

```

## 📋 Controller 코드 패턴 정리

```typescript
export const handleControllerName = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Params/Query 처리 (Controller 책임: 문자열 → 숫자 파싱 필수)
    const id = parseInt(req.params.id as string, 10);
    const cursor = parseInt(req.query.cursor as string, 10) || 0;
    
    // 2️⃣ Body 처리 (DTO 책임: 필요 시 Date 변환, 필터링 등)
    const data = bodyToDTO(req.body);
    
    // 3️⃣ Service 호출
    const result = await service(id, cursor, data);
    
    // 4️⃣ 응답 반환
    res.status(StatusCodes.OK).json({ result });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: (err as Error).message });
  }
};

```

**핵심 요약:** * `req.params`와 `req.query`는 **문자열**이므로 Controller에서 `parseInt()`가 필수!

* `req.body`는 **JSON 타입이 유지**되므로 `parseInt()`가 필요 없고, 비즈니스 성격의 변환만 DTO에서 선택적으로 처리!