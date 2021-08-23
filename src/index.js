const path = require('path')
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { postDevice, getDevices } = require('./device')

const PORT = 9002

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')))

app.get('/state', getDevices)
app.post('/state/:id', postDevice)

const server = createServer(app)

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})

require('./mqtt')
require('./web-socket')
