require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns');
const urlParser = require('url');
const { MongoClient } = require('mongodb');
const { error } = require('console');
const { copyFileSync } = require('fs');

// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.DB_URI);
const db = client.db('shortrls');
const collection = db.collection('urls'); 

app.use(cors());
app.use( bodyParser.urlencoded({ extended: false }) )
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res)=>{
  let url = req.body.url;
  const dnsCheck = dns.lookup(urlParser.parse(url).hostname, async (error, host)=>{
    if(!host)
      return res.json({error: "invalid url"})

    const urlId = await collection.countDocuments({});
    const doc = {
      url,
      shortUrl: urlId
    }

    const result = await collection.insertOne(doc);

    return res.json({
      original_url: url,
      short_url: urlId,
    })
  })

});

app.get("/api/shorturl/:url_id", async (req, res)=>{
  const shortUrl = req.params.url_id;
  const result = await collection.findOne({shortUrl: +shortUrl})
  res.redirect(result.url)
});
