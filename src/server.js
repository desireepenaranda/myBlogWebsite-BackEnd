import fs from "fs";
import admin from "firebase-admin";
import express from "express";
import { db, connectToDb } from "./db.js";

// loading credentials json package
const credentials = JSON.parse(fs.readFileSync("./credentials.json"));
//
admin.initializeApp({ credential: admin.credential.cert(credentials) });

const app = express();
app.use(express.json());

// load user from the auth token included in the request header
app.use(async (req, res, next) => {
  const { authtoken } = req.headers;

  if (authtoken) {
    try {
      const user = await admin.auth().verifyIdToken(authtoken);
    } catch (e) {
      return res.sendStatus(400);
    }
  }
  req.user = req.user || {};
  next();
});

app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    // check to see if user has already upvoted the article
    const upvoteIds = article.upvoteIds || [];
    if (uid) {
      article.canUpVote = !upvoteIds.includes(uid);
    }
    // article.canUpVote = uid && !upvoteIds.includes(uid);
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

app.get("/api/articles", async (req, res) => {
  const articles = await db.collection("articles").find({});
  if (articles) {
    res.json(articles);
  } else {
    res.sendStatus(404);
  }
});

app.put("/api/articles/", async (req, res) => {
  await db.collection("articles").find();

  if (article) {
    res.send(`The ${name} article now has ${article.upvotes} upvotes!!`);
  } else {
    res.send("That article doesn't exist!");
  }
});

app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    // error meaning user not able to access end points
    res.sendStatus(401);
  }
});

app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    const canUpVote = uid && !upvoteIds.includes(uid);

    if (canUpVote) {
      if (upvoteIds === []) {
        upvoteIds.push(uid);
      }
      await db.collection("articles").updateOne(
        { name },
        {
          $inc: { upvotes: 1 },
          $push: { upvoteIds: uid },
        }
      );
    }
    const updatedArticle = await db.collection("articles").findOne({ name });
    res.json(updatedArticle);
  } else {
    res.send("That article doesn't exist!");
  }
});

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  const { postedBy, text } = req.body;
  const email = req.user.email;
  await db
    .collection("articles")
    .updateOne({ name }, { $push: { comments: { postedBy: postedBy, text } } });
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    res.json(article);
  } else {
    res.send("This article did not exist");
  }
});

connectToDb(() => {
  console.log("Successfully connected to DB");
  app.listen(8000, () => {
    console.log("Server is listening on port 8000");
  });
});
