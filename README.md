# simple_firebase_server

Firebse のサーバサイドの共通的なロジックまとめ

heroku にデプロイすることを想定

# Firebase の使い捨てトークン発行

認証画面を作るのが面倒なので、アクセスごとにカスタムトークンを発行する強引な Web アプリ向けの機能

事前に登録されたプロジェクトの AdminSDK の情報から任意のカスタムトークンを取得する
指定されたpath配下の情報を管理(admin）読み（READ)書き（WRITE)できるトークンを発行する。

input:

```
@action = createNode (required)
@path = $path (defaut:"p" + Date.now())
```

output:
{ customToken, refreshToken, idToken, path }

1. refreshToken:永続トークン（認証を永続化する場合はこのトークンを保存すること）
2. databaseURL:Firebase databaseのURL
3. path:発行されたFirebase databaseのパス
4. customToken:１時間で有効期限が切れるカスタムトークン
5. idToken:１時間で有効期限が切れるREST API等で利用するトークン


## Firebase のトークン発行（Refreshトークン（永続トークン）から変換）

createFirebaseNodeで取得したrefreshTokenからその他のトークンを取得する。

input:

```
@action = getToken (required)
@refreshToken = $refreshToken (required)
```

output:
{ customToken, refreshToken, idToken }

1. customToken:１時間で有効期限が切れるカスタムトークン
2. refreshToken:永続トークン（認証を永続化する場合はこのトークンを保存すること）
3. idToken:１時間で有効期限が切れるREST API等で利用するトークン

# 使い方例
## トークン取得＋保存先取得

```request
curl https://firebase-pipe.herokuapp.com/?@action=createNode
```

1. refreshToken -> 以下のトークンを恒久的に取得するためのトークン。localstorage 等に保存することを想定。(有効期限：なし)
2. databaseURL -> 発行された FirebaseDatabase の URL
3. path -> 発行された FirebaseDatabase の PATH(url + path に任意の JSON データの読み書き、ADMIN/READ/WRITE のトークン発行が可能）

4. customToken -> firebase の javascript API を利用する場合はログインに使う(有効期限１時間)
5. idToken -> firebase の REST API を利用する場合は auth に使う(有効期限１時間)

```response
{"customToken":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTY1MzA2MzM1OSwiZXhwIjoxNjUzMDY2OTU5LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay14cmpsdUBiYjVjY2MuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay14cmpsdUBiYjVjY2MuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiJzdG9yZS90bXAwQGFkbWluIiwiY2xhaW1zIjp7InN0b3JlL3RtcDAiOiJhZG1pbiIsInVzZXJfaWQiOiJzdG9yZS90bXAwQGFkbWluIn19.JOX5q3gJ4oYjn9jHratp0U9psgjKeye3hQoTfIO535oDiv5ncm9OSVB9hszgxu90oxMuCy8cDveu77X-87zG9Vl3oZR_btFWvVW0RWEcDqJnrbeygQaXpOX2mwCPpcd9Bo5FU4Yp-HrtYr_A2991qfJhtP_lPJr4vqul1iGUt_KbKnO4YQLUWes5tphMrQvh8yO3cUybZyjQFurfphddDv_ZHt6yUdTJhR_OfAJS-s6Ia6ATmsfzd-r5n65UNRVJkQvyfTjJeAk7Bp1aXHA0mOOl43LBtZLQZ80wW_sNb_Wv6-cSED2R03UAqGNg1S6Kv5PbdpR5dDhfqb9_6mgvRw","refreshToken":"AIwUaOki-0CLKNpy7uTPT1uQXDeWq4qWggqAvE_DGdDUfc0zyJfzFqhg1B8GcDWtKOZJOXHWF1bdyVdnAFPdzlxU0DYHBrJYDvvuFR0CEv_h9hrWTPd5GX9U-G5NgU_pI1YoZZXwwumOqYzD5fUeC_ZfbrLVdiZkOlti2E79OjTGfBFv_hwttcQ","idToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjY5N2Q3ZmI1ZGNkZThjZDA0OGQzYzkxNThiNjIwYjY5MTA1MjJiNGQiLCJ0eXAiOiJKV1QifQ.eyJzdG9yZS90bXAwIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYmI1Y2NjIiwiYXVkIjoiYmI1Y2NjIiwiYXV0aF90aW1lIjoxNjUzMDYwOTk3LCJ1c2VyX2lkIjoic3RvcmUvdG1wMEBhZG1pbiIsInN1YiI6InN0b3JlL3RtcDBAYWRtaW4iLCJpYXQiOjE2NTMwNjMzNTksImV4cCI6MTY1MzA2Njk1OSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.MfNTCZ1P9UT0I54ZQ46c-VcLbPq9au2RaFwjo7XAlaJp7SVtjvPYGht5QMX05xY60kVvwSV6qZ_kXWrFi7wx_wjT1jnMP6EdydGmS9TlZhlcLThZ8N8hMtgtCUKJEhRhIwLvD4bBeQ3QzrA-TlkT9FF1yU9pd9tmwxDJLJCk8lEsrQEHsPchLx7mXxr5ze_fevGSpZY7LyDJ6mNKCRmMy5KhyYIGwO8USV6h1vGrVi4sF_f7H0V6fPjRVTUbEgnbYVcAKVhe8J7bqY71Ji_3KeZ0rEgPAMZ_PlcYQbQ5_ZiVRmC4qNQwgF2Y6PC5lMTgktmtAxM_g_UBANAIQLa3XA"}
```

env に設定

```
refreshToken=AIwUaOmOC573LAjGxKpCK49dF4xxtIlkf-XCWqKPxCZ-GSbAd2Krb4pULu1GG4MpohpkZUgCw25aiKp30uFCg8ni4vY_JPNKuMHzBjR42eC2pvj_q-pDQijhGTxzjw3MKMJvmEgHgMrfW0Gz97I17yVBEPAkZIn-KB0ICMd7Ah0TiXpyLSgJ2OH6eTD_HZM0Ea_pHIeMlACI
idToken=eyJhbGciOiJSUzI1NiIsImtpZCI6IjY5N2Q3ZmI1ZGNkZThjZDA0OGQzYzkxNThiNjIwYjY5MTA1MjJiNGQiLCJ0eXAiOiJKV1QifQ.eyJzdG9yZS9wMTY1MzE4MTUxMTc3NiI6ImFkbWluIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2JiNWNjYyIsImF1ZCI6ImJiNWNjYyIsImF1dGhfdGltZSI6MTY1MzE4MTUxMiwidXNlcl9pZCI6InN0b3JlL3AxNjUzMTgxNTExNzc2QGFkbWluIiwic3ViIjoic3RvcmUvcDE2NTMxODE1MTE3NzZAYWRtaW4iLCJpYXQiOjE2NTMxODE1MTIsImV4cCI6MTY1MzE4NTExMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.RT33BeOUKqJeAq-fzgEt9nDMfMwMlJchJ_hvb5fOUqd8Gj_DtYnRQ6U18Qy7-dXftPMGl1hjTgSTk35ol0QOYQGzDq6Mbd7KL5HKi-9MMY7e0CeRQ3IkrRv69g8GVvHMx_ai5SXpQnnbKB89xcZD86N1vBlMZKP_aHk8s85klbF50_UCRxtsQchDZhRdoAoyTAyBavqgb-jPI7i2xPVhWs5I0N-9JpsM1WRiKXiGf1UEHnq6K0VXS2BWo2R6OIuNrgpklTw7TNFK27syXiXVOaF9WSIefo8n-goDs_F_wDFbCV6CG-IrmFqb1YMxBsK3N7OX7DygLcIeVLbaNFBvGw
path=store/p1653181511776
databaseURL=https://bb5ccc.firebaseio.com

```

## GET

```
curl $databaseURL/$path.json?auth=$idToken
```

```
{"createdAt":1653181512100,"init":true}
```

## UPDATE(一部更新)

```
curl $databaseURL/$path.json?auth=$idToken -X PATCH -d '{
"text": "テストテキスト",
"updatedAt":1653182314000
}'
```

データ：{"createdAt":1653181512100,"init":true,"text":"テストテキスト","updatedAt":1653182314000}

## UPDATE(上蓋更新)

```
curl $databaseURL/$path.json?auth=$idToken -X PUT -d '{
"text": "上書き",
"updatedAt":1653182414000
}'
```

データ：{"text":"上書き","updatedAt":1653182414000}

## POST(追加)

POST すると「"-N2dLovMNUTRcbnFsgDM"」のようなランダムなキーが発行され配下にリクエストの JSON が登録される。
Array ではないところが若干とっつきにくいかも。

```
curl $databaseURL/$path.json?auth=$idToken -X POST -d '{
    "childText":"配列の子要素"
}'
```

データ：{"-N2dLovMNUTRcbnFsgDM":{"childText":"配列の子要素"},"text":"上書き","updatedAt":1653182414000}

## DELETE はできません

新規作成して Refreshtoken のみ取得して削除された場合、別人になりすましてアクセスできる可能性があるため一度作成されたパスは消せないようにする。
削除したい場合は空ではないオブジェクトで PUT すると上書きされる。

```
curl $databaseURL/$path.json?auth=$idToken -X DELETE
```

```
{
  "error" : "Permission denied"
}
```

## トークンを更新
１時間でidTokenは無効化されるので最有効化する場合は、refreshTokenから取り直す。

```request
curl "https://firebase-pipe.herokuapp.com/?@action=getToken&@refreshToken=$refreshToken"
```

refreshToken -> 以下のトークンを恒久的に取得するためのトークン。localstorage 等に保存することを想定。(有効期限：なし)
customToken -> firebase の javascript API を利用する場合はログインに使う(有効期限１時間)
idToken -> firebase の REST API を利用する場合は auth に使う(有効期限１時間)

# その他あると便利な機能をつらつらと実装予定

## 強制 COS

API 化されていない普通の Web ページから一部だけ情報がほしい的な要望を叶えるための機能

input:

```
@action = COS (required)
@url = $url (required)
@headers =@headers = {$headers} (defaut:"{}")
```

output:Http Stream

## proxy

いちいちスクレイピングするまでもないような Web ページを取得するためのプロキシ

input:

```
@action = proxy (required)
@url = $url (required)
@headers = {$headers} (defaut:"{}")
```

output:Http Stream
