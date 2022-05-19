# simple_firebase_server

Firebse のサーバサイドの共通的なロジックまとめ

heroku にデプロイすることを想定

## Firebase の使い捨てトークン発行

認証画面を作るのが面倒なので、アクセスごとにカスタムトークンを発行する強引な Web アプリ向けの機能

事前に登録されたプロジェクトの AdminSDK の情報から任意のカスタムトークンを取得する
指定されたpath配下の情報を管理(admin）読み（READ)書き（WRITE)できるトークンを発行する。

input:

```
$$action = createNode (required)
$$path = $path (defaut:"p" + Date.now())
```

output:
{ customToken, refreshToken, idToken, path }

1. customToken:１時間で有効期限が切れるカスタムトークン
2. refreshToken:永続トークン（認証を永続化する場合はこのトークンを保存すること）
3. idToken:１時間で有効期限が切れるREST API等で利用するトークン
4. path:発行されたパス

## Firebase のトークン発行（Refreshトークン（永続トークン）から変換）

createFirebaseNodeで取得したrefreshTokenからその他のトークンを取得する。

input:

```
$$action = getToken (required)
$$refreshToken = $refreshToken (required)
```

output:
{ customToken, refreshToken, idToken }

1. customToken:１時間で有効期限が切れるカスタムトークン
2. refreshToken:永続トークン（認証を永続化する場合はこのトークンを保存すること）
3. idToken:１時間で有効期限が切れるREST API等で利用するトークン

## 強制 COS

API 化されていない普通の Web ページから一部だけ情報がほしい的な要望を叶えるための機能

input:

```
$$action = COS
$$url = $url
$$option = {$option}
```

output:
{body}

## proxy

いちいちスクレイピングするまでもないような Web ページを取得するためのプロキシ

input:

```
$$action = proxy
$$url = $url
$$option = {$option}
```

output:HTML Stream
