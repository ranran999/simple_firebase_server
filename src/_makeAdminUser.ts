import 'dotenv/config'
import { Firebase } from './firebaseWrap';
const FIREBASE_SERVER_INIT = JSON.parse(process.env.FIREBASE_SERVER_INIT as string);
const FIREBASE_FRONT_INIT = JSON.parse(process.env.FIREBASE_FRONT_INIT as string);

const main = async () => {
  const f = new Firebase(FIREBASE_FRONT_INIT, FIREBASE_SERVER_INIT);
  //いまのところ store/*のパスしか作られない想定のため、ルールで管理者と判定させる。
  const customToken = await f.createAdminCustomToken("admin");
  const refreshToken = await f.customToken2refreshToken(customToken);
  // herokuのデプロイ先と合わせて簡易バックアップコマンドを生成
  console.log(refreshToken);
  console.log(`DATABASE_URL=${f.databaseURL}`)
  console.log(`ID_TOKEN=$(curl "https://firebase-pipe.herokuapp.com/?@action=getToken&@refreshToken=${refreshToken}" | jq -r '.idToken')`)
  console.log(`curl $DATABASE_URL/store.json?auth=$ID_TOKEN > out_$(date +%d).json`)
}
main();
