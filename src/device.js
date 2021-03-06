const fs = require('fs')

const filePath = './data.json'

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]))
}

function readDevices() {
  return JSON.parse(fs.readFileSync(filePath))
}

// Update device by id
function updateDevice(deviceId, data) {
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

// Add new device or update by mac address if exists
function addDevice(data) {
  try {
    const devices = JSON.parse(fs.readFileSync(filePath))
    const deviceIndex = devices.findIndex((device) => device.mac === data.mac)
    if (deviceIndex > -1) {
      // const device = devices[deviceIndex]
      // devices[deviceIndex] = { ...device, ...data }
      const newData = { ...data }
      delete newData.mac
      updateDevice(deviceIndex, newData)
    } else if (data.id && data.ip && data.mac) {
      devices.push(data)
      fs.writeFileSync(filePath, JSON.stringify(devices))
    }
    return true
  } catch (err) {
    throw new Error(err)
  }
}

function getDevice(id) {
  const devices = readDevices()
  return devices.find((item) => item.id === id)
}

module.exports = {
  getDevice, updateDevice, readDevices, addDevice,
}
