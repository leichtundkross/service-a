const express = require('express')
const axios = require('axios').default
const app = express()
const port = process.env.PORT || 3000

app.get('/hello/:name', async (req, res) => {
  const response = await axios.get('https://timeapi.io/api/time/current/zone?timeZone=Europe%2FBerlin')

  res.send(`Kalimera! ${req.params.name}. The date is ${response.data.dateTime}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
