const path = require('path')
const express = require('express')
const cors = require('cors')
const mqtt = require('mqtt')
const { createServer } = require('http')
const {
  postState, writeState, getStates, readStates,
} = require('./state')

const PORT = 9002

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')))

app.get('/state', getStates)
app.post('/state/:id', postState)

const server = createServer(app)

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})

const MQTT_BROKER = 'ws://192.168.0.195:9001'

const mqttClient = mqtt.connect(MQTT_BROKER)

mqttClient.on('connect', () => {
  console.log('Connected !')

  mqttClient.subscribe('stat/#', (err) => {
    if (err) {
      console.error(err)
    }
  })

  mqttClient.subscribe('tasmota/discovery/#', (err) => {
    if (err) {
      console.error(err)
    }
  })

  // mqttClient.publish('cmnd/tasmota_6C09EE/Power2')
})

mqttClient.on('message', (topic, message) => {
  // console.log(`${topic}:${message.toString()}`)

  // Discovery and update devices list
  if (topic.startsWith('tasmota/discovery') && topic.endsWith('config')) {
    const data = JSON.parse(message.toString())
    writeState(
      {
        id: data.t,
        ip: data.ip,
        mac: data.mac,
        model: data.md,
      },
    )
  }

  // Update devices state
  if (topic.startsWith('stat/') && topic.endsWith('RESULT')) {
    const deviceId = (topic.split('/'))[1]
    const devices = readStates()
    const deviceIndex = devices.findIndex((device) => device.id === deviceId)
    const data = JSON.parse(message.toString())
    const device = { ...devices[deviceIndex], ...data }
    writeState(device)
  }
})

mqttClient.on('error', (err) => {
  console.log('error', err)
})
