const express = require("express");
const Data = require('./Data.json')
require("dotenv").config();
const app = express();
const port = 3000;
app.use(express.static("public"));
app.get("/api/autocomplete", async (request, response) => {
  try {
    const { query } = request;
    let check = query.keyword.toLowerCase()
  let filterData = Data.filter((items)=>{
    if(items.name.toLowerCase().match(check)){
      return items
    }
    // else if (items.city_code.toLowerCase().match(check)){
    //   return items
    // }
    // else if (items.name_translations.en.toLowerCase().match(check)){
    //   return items
    // }
    
    // else if (items.time_zone.en.toLowerCase().match(check)){
    //   return items
    // }

  })
    response.json(filterData);
  } catch (error) {
    console.error(error.response);
    response.json([]);
  }
});
app.get("/api/search", async (request, response) => {
  try {
    const { query } = request;
    // console.log(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${query.origin}&destination=${query.destination}&unique=false&sorting=price&direct=false&currency=usd&limit=30&page=1&token=aebed97e88519a5cb765d5c68866a86b`,'url')
    response.json(query);
  } catch (error) {
    console.error(error.response);
    response.json([]);
  }
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
