const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const cors = require("cors");
// Enable CORS for all routes
app.use(cors());
const dbpath = path.join(__dirname, "variants.db");
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(5000, () => {
      console.log("Server is running at http://localhost:5000");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};

initialize();

//1. get all
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.get("/:username", async (request, response) => {
  const { username } = request.params;
  const getmsg = `
      select
           *
       from
            variant
       where name= '${username}'
    `;
  const userVariant = await db.get(getmsg);
  // console.log("data", !userVariant);
  if (!userVariant) {
    response.status(400);
    // response.send("no such user");
    response.json({ error: "No such user" });
  } else {
    // response.send(userVarieant);
    response.json(userVariant);
  }
});

//2. post
app.use(express.json());
app.post("/edit", async (request, response) => {
  const details = request.body;
  const { name, about, introduction, msg } = details;
  console.log(details);
  const checkUserQuery = `
        select * from variant where name = '${name}'
  `;
  const isUserExist = await db.get(checkUserQuery);

  if (isUserExist != undefined) {
    response.status(400);
    response.json({ error: "User already exists" });
  } else {
    const add = `
         insert into 
             variant(name,about,introduction, msg)
         values
             ('${name}','${about}' , '${introduction}' , '${msg}');
      `;
    const dbpostresponse = await db.run(add);
    response.status(200);
    // response.send("Msg added");
    response.json({ msg: "Msg added " });
  }
});

module.exports = app;
