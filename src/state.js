const fs = require('fs')

const filePath = './data.json'

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]))
}

function readStates() {
  return JSON.parse(fs.readFileSync(filePath))
}

// Update device state by id
function updateState(deviceId, data) {
  try {
    const devices = JSON.parse(fs.readFileSync(filePath))
    const deviceIndex = devices.findIndex((device) => device.id === deviceId)
    if (deviceIndex > -1) {
      devices[deviceIndex] = { ...devices[deviceIndex], ...data }
      fs.writeFileSync(filePath, JSON.stringify(devices))
    }
    return true
  } catch (err) {
    throw new Error(err)
  }
}

// Update device state by mac address or add a new device
function writeState(data) {
  try {
    const states = JSON.parse(fs.readFileSync(filePath))
    const deviceIndex = states.findIndex((device) => device.mac === data.mac)
    if (deviceIndex > -1) {
      states[deviceIndex] = data
    } else {
      states.push(data)
    }
    fs.writeFileSync(filePath, JSON.stringify(states))
    return true
  } catch (err) {
    throw new Error(err)
  }
}

function getStates(req, res) {
  res.json(readStates())
}

function postState(req, res) {
  const deviceId = req.params.id
  const data = req.body
  const devices = readStates()
  const deviceIndex = devices.findIndex((item) => item.id === deviceId)
  if (deviceIndex > -1) {
    const device = { ...devices[deviceIndex], ...data }
    writeState(device)
    res.status(201).send()
  }
  res.status(404).send()
}

module.exports = {
  getStates, postState, updateState, readStates, writeState,
}
