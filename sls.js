const express = require('express')
const cors = require('cors')
const path = require('path')
const fetch = require('node-fetch');
const swaggerToTS = require("openapi-typescript").default;
const queryString = require('querystring')
const app = express()
app.use(cors())

const RSSHub = require('rsshub-serverless');
RSSHub.init({
  // config
});

// Routes
app.get(`/`, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/proxy', (req, res) => {
  if (!req.query.url) res.status(400).send('URL Error')
  console.log(req.query.url)
  fetch(req.query.url)
    .then(res => res.text())
    .then(text => {
      switch (req.query.formatter) {
        case 'json-swagger':
          const json = JSON.parse(text)
          res.send({
            raw: json,
            ts: swaggerToTS(json)
          })
          break;
        default:
          res.send({
            raw: text
          })
          break;
      }
    })
    .catch(e => {
      console.log(e)
    });
})

app.get('/rss', (req, res) => {
  if (!req.query.url) res.status(400).send('URL Error')
  const { url, ...others } = req.query
  if (/http/.test(url)) {
    // TODO: 解析其他 RSS 源
    return
  }
  // 自建 RSSHub
  RSSHub.request(req.query.url + '?' + queryString.stringify(others))
    .then((data) => {
      res.send(data)
    })
    .catch((e) => {
      console.log(e);
    });
})


app.listen(8080)

module.exports = app
