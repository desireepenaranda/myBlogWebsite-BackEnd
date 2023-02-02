import express from "express";
import { db, connectToDb } from "./db.js";

const app = express();
app.use(express.json());

app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params;
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

app.get("/api/articles", async (req, res) => {
  console.log("made it into the articles get function");
  const articles = await db.collection("articles").find({});
  console.log(articles);
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

app.put("/api/articles/:name/upvote", async (req, res) => {
  console.log("wihtihn the upvote API request ");
  const { name } = req.params;

  await db.collection("articles").updateOne(
    { name },
    {
      $inc: { upvotes: 1 },
    }
  );
  const article = await db.collection("articles").findOne({ name });

  if (article) {
    res.send(article);
  } else {
    res.send("That article doesn't exist!");
  }
});

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  const { postedBy, text } = req.body;

  await db
    .collection("articles")
    .updateOne({ name }, { $push: { comments: { postedBy, text } } });
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
