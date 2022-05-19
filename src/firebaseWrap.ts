import axios from 'axios';
import * as admin from 'firebase-admin'
import { initializeApp, FirebaseOptions } from "firebase/app";

import { signInWithCustomToken, getAuth, User } from "firebase/auth";

export class Firebase {
  project_id: string;
  app: admin.app.App;
  frontApp: any;
  apiKey: any;
  constructor(frontInit: FirebaseOptions, serverInit: object, databaseURL: string, project_id: string) {
    this.project_id = project_id;
    this.apiKey = frontInit.apiKey;
    this.app = admin.apps.find(e => e?.name === project_id)
      || admin.initializeApp({
        credential: admin.credential.cert(serverInit),
        databaseURL
      }, project_id)
    this.frontApp = initializeApp(frontInit, project_id);
  }
  /* 1時間で無効になるトークンを返却 */
  async createAdminCustomToken(path: string) {
    const uid = path + "@admin"
    const claims = {} as { [key: string]: string };
    claims[path] = "admin";
    // １時間で切れるトークン
    return await this.app.auth().createCustomToken(uid, claims)
  }
  /* カスタムトークンをRefreshトークン（恒久トークン）にして返却 */
  async customToken2refreshToken(customToken: string) {
    const auth = getAuth(this.frontApp as any);
    const cu = await signInWithCustomToken(auth, customToken);
    //恒久トークン取得
    return cu.user.refreshToken;
  }
  /* Refreshトークン（恒久トークン）からidTokenを返却 */
  async refreshToken2idToken(refreshToken: string) {
    let refreshtokenResponse;
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    refreshtokenResponse = await axios.post('https://securetoken.googleapis.com/v1/token?key=' + this.apiKey, params);
    return refreshtokenResponse.data.access_token;
  }
  /* IDトークンから１時間で切れるカスタムトークンを返却 */
  async idToken2CustomToken(idToken: string) {
    const decode = await this.app.auth().verifyIdToken(idToken)
    const uid = decode.uid;
    const claims = {} as { [key: string]: string };
    // デフォルトキー以外を詰め替え
    const keys = Object.keys(decode).filter(k =>
      ![
        'aud',
        'auth_time',
        'email',
        'email_verified',
        'exp',
        'firebase',
        'iat',
        'iss',
        'phone_number',
        'picture',
        'sub',
        'uid'
      ].includes(k));
    keys.forEach(k => {
      claims[k] = decode[k]
    })

    return await this.app.auth().createCustomToken(uid, claims)
  }
}
export class FirebaseExtend extends Firebase {
  /* ADMIN権限を持つカスタムトークンから任意の権限（ADMIN/READ/WRITE)をもつ子供のカスタムトークンを返却 */
  async createChildCustomToken(customToken: string, auth: { [key: string]: string }) {
    const claims = {} as { [key: string]: string };
    Object.keys(auth).forEach(k => claims[k] = auth[k]);
    const decode = await this.app.auth().verifyIdToken(customToken)
    if (!Object.keys(auth).every(k => decode[k] === "admin")) {
      throw `no admin.
    decode:${JSON.stringify(decode)}
    request:${JSON.stringify(auth)}`;
    }
    const uid = decode.uid.split("@")[0] + "@c" + Date.now();
    return await this.app.auth().createCustomToken(uid, claims)
  }
}
