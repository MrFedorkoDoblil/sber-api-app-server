# Base env vars
PORT=3000
JWT_ACCESS_SECRET = qwerty123456
JWT_ACCESS_EXPIRES = 72000
JWT_REFRESH_SECRET = qwerty1234567
JWT_REFRESH_EXPIRES = 72000


# SberbusinessAPI parameters from personal cabinet
SB_ID_AUTH_REDIRECT_URI = https://localhost:3000/auth/login
SB_ID_AUTH_CLIENT_ID = 111333
SB_ID_CLIENT_SECRET = qwerty123

# Sberbusiness ID AUTHORIZATION endpoints
SBB_BASE_URL = https://edupirfintech.sberbank.ru:9443/
SB_ID_AUTH_URL = https://edupirfintech.sberbank.ru:9443/ic/sso/api/v2/oauth/authorize
SB_ID_TOKEN_URL = https://edupirfintech.sberbank.ru:9443/ic/sso/api/v2/oauth/token
SB_ID_USER_INFO_URL = https://edupirfintech.sberbank.ru:9443/ic/sso/api/v2/oauth/user-info
SB_ID_AUTH_SCOPE = inn ogrn openid email

# Запуск сервера в режиме разработки
1. Заполнить переменные окружения
2. Запустить MongoDB на порту 27018 ("docker-compose up -d" в текущей дирректории)
3. Пока нет возможности входить по SBER Business ID необходимо создать пользователя по следующему маршруту "/user  POST". Передать в тело запроса 'login' , 'password'.
4. Заполнить данные из СберБизнесID по маршруту "/user  PATCH".  Передать в тело запроса "sbbAccessToken", "sbbRefreshToken", "sub", "scope"- данные полученные при входе через SBBID
5. Авторизоваться по маршруту "/auth POST" -  Передать в тело запроса 'login' , 'password'. Ответ - значение  accessToken.
6. Отправить запрос на получение данных о компании "/company GET" "Authorization": "Bearer <accessToken>", где "accessToken" - значение полученное в п.5
7. Отправить запрос на получение мок-данных о компании "/company/fake GET" "Authorization": "Bearer <accessToken>", где "accessToken" - значение полученное в п.5
