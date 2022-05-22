import axios from 'axios';
import 'dotenv/config'
import express from "express"
import { Firebase } from './firebaseWrap';
const app = express();
const FIREBASE_SERVER_INIT = JSON.parse(process.env.FIREBASE_SERVER_INIT as string);
const FIREBASE_FRONT_INIT = JSON.parse(process.env.FIREBASE_FRONT_INIT as string);

app.set("port", process.env.PORT || 5000);
app.use(express.static(__dirname + "/public"));
//今のところ一つでOK
const f = new Firebase(FIREBASE_FRONT_INIT, FIREBASE_SERVER_INIT);
const all = async (req: express.Request, res: express.Response) => {
  switch (req.query["@action"]) {
    case "createNode": {
      let path = req.query["@path"] as string;
      if (!path) {
        path = "p" + Date.now();
      } else {
        path = path.indexOf("/") === 0 ? path.substring(1) : path
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
      const databaseURL = f.databaseURL;
      res.end(JSON.stringify({ customToken, refreshToken, idToken, path, databaseURL }));
      break
    }
    case "getToken": {
      const refreshToken = req.query["@refreshToken"] as string;
      const idToken = await f.refreshToken2idToken(refreshToken);
      const customToken = await f.idToken2CustomToken(idToken);

      res.end(JSON.stringify({ customToken, refreshToken, idToken }));
      break
    }
    case "COS": {
      const url = req.query["@url"] as string;
      const headers = JSON.parse(req.query["@headers"] as string | null || "{}");
      const config = {
        headers: {
          ...headers
        },
        responseType: 'stream'
      };
      try {
        const response = await axios(url, config as any)
        Object.keys(response.headers)
          .forEach((key: string) => {
            res.setHeader(key, response.headers[key]);
          })
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Authorization, Accept, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.data.pipe(res)
      } catch (e: any) {
        res.status(500).send(e.message);
      }
      break
    }
    case "proxy": {
      const url = req.query["@url"] as string;
      const headers = JSON.parse(req.query["@headers"] as string | null || "{}");
      const config = {
        headers: {
          ...headers
        },
        responseType: 'stream'
      };
      try {
        const response = await axios(url, config as any)
        Object.keys(response.headers)
          .forEach((key: string) => {
            res.setHeader(key, response.headers[key]);
          })
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Authorization, Accept, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.data.pipe(res)
      } catch (e: any) {
        res.status(500).send(e.message);
      }
      break
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

