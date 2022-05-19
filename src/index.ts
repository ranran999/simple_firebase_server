import 'dotenv/config'
import express from "express"
import { Firebase } from './firebaseWrap';
const app = express();
const FIREBASE_SERVER_INIT = JSON.parse(process.env.FIREBASE_SERVER_INIT as string);
const FIREBASE_FRONT_INIT = JSON.parse(process.env.FIREBASE_FRONT_INIT as string);
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID as string;
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL as string;

app.set("port", process.env.PORT || 5000);
app.use(express.static(__dirname + "/public"));
//今のところ一つでOK
const f = new Firebase(FIREBASE_FRONT_INIT, FIREBASE_SERVER_INIT, FIREBASE_DATABASE_URL, FIREBASE_PROJECT_ID);
const all = async (req: express.Request, res: express.Response) => {
  switch (req.query["$$action"]) {
    case "createNode": {
      let path = req.query["$$path"] as string;
      if (!path) {
        path = "p" + Date.now();
      } else {
        path = path.split("/")[0]
      }
      path = "store/" + path;
      const ss = await f.app.database().ref(path).get();
      if (ss.exists()) {
        console.log(path + " is exists.");
        res.status(500).send(path + " is exists.");
        return;
      } else {
        await ss.ref.set({ init: true, createdAt: Date.now() })
      }
      const customToken = await f.createAdminCustomToken(path);
      const refreshToken = await f.customToken2refreshToken(customToken);
      const idToken = await f.refreshToken2idToken(refreshToken);

      res.end(JSON.stringify({ customToken, refreshToken, idToken, path }));
    }
    case "getToken": {
      const refreshToken = req.query["$$refreshToken"] as string;
      const idToken = await f.refreshToken2idToken(refreshToken);
      const customToken = await f.idToken2CustomToken(idToken);

      res.end(JSON.stringify({ customToken, refreshToken, idToken }));
    }
    default:
      res.end("ok");
      break
  }
}

app.all("*", async (req: express.Request, res: express.Response) => {
  try {
    await all(req, res);
  } catch (e) {
    console.trace(e);
    res.send("ok");
  }

});
app.listen(app.get("port"), () => {
  console.log("Node app is running at http://localhost:" + app.get("port"));
});

