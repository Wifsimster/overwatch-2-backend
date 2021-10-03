const MQTT_BROKER = 'ws://192.168.0.195:9001'

const mqtt = require('mqtt')
const { addDevice, readDevices, updateDevice } = require('./device')

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

  mqttClient.subscribe('tele/#', (err) => {
    if (err) {
      console.error(err)
    }
  })
})

mqttClient.on('message', (topic, message) => {
  // Update device status (Online or Offline)
  if (topic.startsWith('tele/') && topic.endsWith('/LWT')) {
    const deviceId = (topic.split('/'))[1]
    updateDevice(deviceId, {
      status: message.toString(),
    })
  }

  if (topic.startsWith('tele/') && topic.endsWith('/STATE')) {
    try {
      const deviceId = (topic.split('/'))[1]
      const data = JSON.parse(message.toString())
      const updateData = {
        status: 'Online',
        uptimeSec: data.UptimeSec,
        lastUpdate: data.Time,
      }
      if (data.POWER) { updateData.POWER = data.POWER }
      if (data.POWER1) { updateData.POWER = data.POWER1 }
      if (data.POWER2) { updateData.POWER = data.POWER2 }
      if (data.Wifi) { updateData.wifi = data.Wifi }

      updateDevice(deviceId, updateData)
    } catch (err) {
      console.error(err)
    }
  }

  if (topic.startsWith('tele/') && topic.endsWith('/SENSOR')) {
    try {
      const deviceId = (topic.split('/'))[1]
      const data = JSON.parse(message.toString())
      updateDevice(deviceId, {
        status: 'Online',
        lastUpdate: data.Time,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Discovery and update devices list
  if (topic.startsWith('tasmota/discovery') && topic.endsWith('config')) {
    try {
      const data = JSON.parse(message.toString())
      addDevice({
        id: data.t,
        ip: data.ip,
        mac: data.mac,
        model: data.md,
        states: data.state,
        firmwareVersion: data.sw,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Update devices state
  if (topic.startsWith('stat/') && topic.endsWith('RESULT')) {
    try {
      const deviceId = (topic.split('/'))[1]
      const devices = readDevices()
      const deviceIndex = devices.findIndex((device) => device.id === deviceId)
      const data = JSON.parse(message.toString())
      const device = { ...devices[deviceIndex], ...data }
      addDevice(device)
    } catch (err) {
      console.error(err)
    }
  }
})

mqttClient.on('error', (err) => {
  console.log('error', err)
})

module.exports = { mqttClient }
