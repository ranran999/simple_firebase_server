# simple_firebase_server

Firebse のサーバサイドの共通的なロジックまとめ

heroku にデプロイする

以下の機能をいかなるメソッド、パスにも影響せずに返却するため、URL クエリ

## Firebase の使い捨てカスタムトークン発行

認証画面を作るのが面倒なので、アクセスごとにカスタムトークンを発行する強引な Web アプリ向けの機能

事前に登録されたプロジェクトの AdminSDK の情報から任意のカスタムトークンを取得する

input:

```
$$action = getFirebaseCustomToken
$$projectId = $projectId
$$userId = $userId
$$additionalClaims = {$additionalClaims}
```

output:
{token}

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
