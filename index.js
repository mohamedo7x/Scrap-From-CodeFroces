const express = require("express");
const cheerio = require("cheerio");
const path = require("path");
const axios = require("axios");
const cors = require('cors')
const dot = require('dotenv')
const app = express();

const fs = require("fs");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors('*'))
dot.config();

//config
let LoadMainBage = false;


//dataBase
let info = {};
let metrials = [];

async function getProblemsNameAndNumber() {
  for (let i = 1; i <= 3; i++) {
    const response = await axios.get(
      `https://codeforces.com/problemset/page/${i}`
    );
    const $ = cheerio.load(response.data);
    $(".problems > tbody > tr").each((index, element) => {
      const problemNumber = $(element).find(".id").text().trim();
      const problemName = $(element).find("td > div > a").first().text().trim();
      info[problemNumber] = problemName;
    });
  }
}

async function getSpesificeProblemStory(id) {
  const response = await axios.get(
    `https://codeforces.com/problemset/problem/${id[0]}/${id[1]}`
  );
  const $ = cheerio.load(response.data);
  let txt = [];

  $(".problem-statement > div > p").each((index, element) => {
    const p = $(element).text().trim();
    txt.push(p);
  });
  const metrial = $(".borderTopRound > ul > li >span >a ").each(
    (index, element) => {
      const item = $(element).text().trim();
      metrials.push(item);
    }
  );
  return txt;
}

app.get('/ok' , (req , res)=> {
  res.send('ok👍')
})

app.get("/", async (req, res) => {
  res.render("index", { info });
});

app.get("/problem/:id", async (req, res) => {
  const { id } = req.params;
  const splitCharsAndNumbers = (str) => str.match(/\d+|\D+/g);
  const data = await getSpesificeProblemStory(splitCharsAndNumbers(id));
  let metadata = {
    id,
    message: data.join("\n"),
    contest: metrials,
  };
  res.render("problem", { metadata });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {

    if(!LoadMainBage){
        LoadMainBage = true;
        getProblemsNameAndNumber();
    }
  console.log(`http://localhost:${port}/`);
});
