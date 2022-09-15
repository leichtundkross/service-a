const express = require('express')
const axios = require('axios').default
const app = express()
const port = process.env.PORT || 3000

app.get('/hello/:name', async (req, res) => {
  // TODO: this should point to service B
  const response = await axios.get('https://timezoneapi.io/api/timezone/?Europe/Berlin&token=aleNAMdkOzvJjkMmlmzw')

  res.send(`Hello ${req.params.name}. The date is ${response.data.data.datetime.date_time}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
