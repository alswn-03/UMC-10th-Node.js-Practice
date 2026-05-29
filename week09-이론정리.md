
# 🚀 [week9 핵심 keyword] OAuth 2.0, JWT, Bearer Token
---

## 1. OAuth 2.0

OAuth 2.0은 **권한을 위임하는 방식**입니다.

예를 들어 사용자가 우리 서비스에서 **Google 로그인**을 한다고 해보겠습니다.

이때 우리 서비스가 직접 사용자의 Google 비밀번호를 받는 것이 아닙니다.

대신 Google에게 다음과 같이 요청합니다.

> 이 사용자가 우리 서비스에 자기 Google 프로필 정보를 제공해도 된다고 허락했는지 확인해줘.

사용자가 동의하면 Google은 우리 서버에 인증 결과를 알려주고, 우리 서버는 그 정보를 바탕으로 사용자를 로그인 처리합니다.

즉, 소셜 로그인에서는 OAuth 2.0 방식을 많이 사용합니다.

OAuth 2.0의 흐름은 다음과 같습니다.

```txt
사용자 → Google 로그인
Google → 사용자 확인
Google → 우리 서버에 인증 결과 전달
우리 서버 → 자체 로그인 처리
```

---

## 2. JWT

JWT는 로그인한 사용자의 정보를 담은 **토큰 형식**입니다.

서버가 사용자를 확인한 뒤, 다음과 같은 정보를 담은 토큰을 만들어 클라이언트에게 발급합니다.

```txt
userId: 13
email: test@example.com
```

클라이언트는 이 토큰을 저장해두었다가, 이후 인증이 필요한 API를 요청할 때마다 서버에 함께 보냅니다.

그러면 서버는 이 토큰을 확인해서 사용자가 누구인지 판단할 수 있습니다.

즉, JWT는

> “이 사용자는 로그인된 사용자입니다.”

를 증명하는 **디지털 출입증**이라고 볼 수 있습니다.

---

JWT 방식에서는 보통 토큰을 하나만 발급하지 않고, 다음 두 가지 토큰을 함께 발급합니다.

```txt
accessToken
refreshToken
```

둘 다 JWT 형식일 수 있지만, 역할은 다릅니다.

---

### accessToken

`accessToken`은 **실제 API 요청에 사용하는 토큰**입니다.

예를 들어 마이페이지처럼 로그인한 사용자만 접근할 수 있는 API를 호출할 때, 클라이언트는 요청 헤더에 `accessToken`을 함께 보냅니다.

```txt
Authorization: Bearer accessToken값
```

서버는 이 `accessToken`을 확인해서 다음을 판단합니다.

* 이 토큰이 유효한가?
* 이 사용자는 누구인가?
* 이 사용자가 이 API에 접근할 수 있는가?

즉, `accessToken`은 API에 들어갈 때 보여주는 **출입증**입니다.

다만 `accessToken`은 실제 요청마다 사용되기 때문에 탈취되면 위험합니다.
그래서 보통 유효 시간을 짧게 설정합니다.

```txt
예: 15분, 30분, 1시간
```

---

### refreshToken

`refreshToken`은 **accessToken을 다시 발급받기 위한 토큰**입니다.

`accessToken`은 보안상 수명이 짧기 때문에 시간이 지나면 만료됩니다.

그런데 `accessToken`이 만료될 때마다 사용자가 다시 로그인해야 한다면 너무 불편합니다.

그래서 `refreshToken`을 사용합니다.

`refreshToken`은 API 요청에 매번 사용하는 토큰이 아닙니다.
`accessToken`이 만료되었을 때 새로운 `accessToken`을 발급받기 위해 사용합니다.

즉, `refreshToken`은 **accessToken 재발급권**이라고 볼 수 있습니다.

---

### JWT 로그인 흐름

JWT를 사용하는 로그인 흐름은 다음과 같습니다.

```txt
1. 사용자가 로그인한다.
2. 서버가 사용자를 확인한다.
3. 서버가 accessToken과 refreshToken을 발급한다.
4. 클라이언트는 토큰을 저장한다.
5. 인증이 필요한 API 요청 시 accessToken을 함께 보낸다.
6. 서버는 accessToken을 검증하고 요청을 처리한다.
7. 시간이 지나 accessToken이 만료된다.
8. 클라이언트는 refreshToken으로 새 accessToken을 요청한다.
9. 서버는 refreshToken을 검증한 뒤, 새 accessToken을 발급한다.
10. 클라이언트는 새 accessToken으로 다시 API 요청을 보낸다.
```

---

#### JWT 정리

```txt
JWT = 로그인한 사용자를 증명하는 토큰 형식
accessToken = 실제 API 요청에 사용하는 짧은 수명의 토큰
refreshToken = accessToken을 재발급받기 위한 긴 수명의 토큰
Bearer Token = accessToken을 Authorization 헤더에 담아 보내는 방식
```

즉, JWT 방식에서는 서버가 로그인 성공 후 `accessToken`과 `refreshToken`을 발급합니다.

클라이언트는 `accessToken`을 사용해 인증이 필요한 API를 호출하고, `accessToken`이 만료되면 `refreshToken`을 사용해 새로운 `accessToken`을 발급받습니다.

이렇게 하면 사용자는 매번 다시 로그인하지 않아도 로그인 상태를 유지할 수 있습니다.

---

## 3. Bearer Token

Bearer Token은 **JWT 같은 토큰을 서버에 보내는 방식**입니다.

인증이 필요한 API를 호출할 때 요청 헤더에 아래와 같이 넣습니다.

```txt
Authorization: Bearer accessToken값
```

즉, `Bearer`는 아래와 같은 뜻입니다.

> 이 토큰을 가진 사람을 인증된 사용자로 봐주세요.

Postman에서 `Authorization > Bearer Token`을 선택하고 토큰을 넣으면, 실제 요청에는 자동으로 이런 헤더가 붙습니다.

```txt
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

정리하면, Bearer Token은 토큰 자체를 의미한다기보다는 **accessToken을 Authorization 헤더에 담아 서버로 보내는 방식**
