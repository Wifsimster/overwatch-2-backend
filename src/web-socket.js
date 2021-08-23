const { WebSocket, WebSocketServer } = require('ws')
const { readDevices, updateDevice, getDevice } = require('./device')
const { mqttClient } = require('./mqtt')

const wss = new WebSocketServer({ port: 8080 })

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

let interval = null
const updateInterval = 1000

wss.on('connection', (ws) => {
  // New client, send all available data
  ws.send(JSON.stringify({ devices: readDevices() }))

  // Broadcast received message
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString())
    const device = getDevice(message.device.id)
    const ratio = 100 / device.duration

    switch (message.prefix) {
    case 'update':
      if (device) {
        updateDevice(device.id, message.device)
        broadcast({ devices: readDevices() })
      }
      break
    case 'open':
      if (device && device.openedAt < 100 && device.duration) {
        mqttClient.publish(`cmnd/${device.id}/Power1`, '1')
        device.isOpening = true

        interval = setInterval(() => {
          if (device.openedAt < 100 - ratio) {
            device.openedAt += ratio
          } else {
            clearInterval(interval)
            device.openedAt = 100
            device.isOpening = false
            mqttClient.publish(`cmnd/${device.id}/Power1`, '0')
          }
          updateDevice(device.id, device)
          broadcast({ devices: readDevices() })
        }, updateInterval)
      }
      break
    case 'close':
      if (device && device.openedAt > 0 && device.duration) {
        mqttClient.publish(`cmnd/${device.id}/Power2`, '1')
        device.isClosing = true

        interval = setInterval(() => {
          if (device.openedAt > 0 + ratio) {
            device.openedAt -= ratio
          } else {
            clearInterval(interval)
            device.openedAt = 0
            device.isClosing = false
            mqttClient.publish(`cmnd/${device.id}/Power2`, '0')
          }
          updateDevice(device.id, device)
          broadcast({ devices: readDevices() })
        }, updateInterval)
      }
      break
    case 'stop':
      if (device) {
        mqttClient.publish(`cmnd/${device.id}/Power1`, '0')
        mqttClient.publish(`cmnd/${device.id}/Power2`, '0')
        clearInterval(interval)
        device.isOpening = false
        device.isClosing = false
        updateDevice(device.id, device)
        broadcast({ devices: readDevices() })
      }
      break
    default:
      broadcast(data)
    }
  })
})

wss.on('close', () => {
  console.log('Connection lost')
})
