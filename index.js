import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"World",
  password:"Vishal@123",
  port: 5432
});
db.connect();


const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  let result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((code)=>{
    countries.push(code.country_code);
  })
  result = {countries:countries,total:countries.length};
  res.render("index.ejs",result);
});

async function getVisitedCountries(){
  let result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((code)=>{
    countries.push(code.country_code);
  })
  result = {countries:countries,total:countries.length};
  return result; 
}

app.post("/add",async(req,res)=>{
  let input = req.body['country'];

  console.log(input);
  try{
    let result = await db.query("SELECT country_code from countries WHERE LOWER(country_name) Like '%' || $1 || '%';",
    [input.toLowerCase()]
  );

    let code = result.rows[0].country_code;
    console.log(code);
    console.log(result.rows);
    await db.query("INSERT INTO visited_countries(country_code) VALUES($1)",[code]);

    res.redirect("/");
  }
  catch(err){
    console.log("error"+err);
    
    let visitedCountries = await getVisitedCountries();
    console.log(visitedCountries);
    res.render("index.ejs",{
      countries: visitedCountries["countries"],
      total:visitedCountries["total"],
      error: "Country has already been added,try other ",
    });
  }
  

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

