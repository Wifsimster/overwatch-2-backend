const { readDevices, addDevice } = require('../device')

function postDevice(req, res) {
  const deviceId = req.params.id
  const data = req.body
  const devices = readDevices()
  const deviceIndex = devices.findIndex((item) => item.id === deviceId)
  if (deviceIndex > -1) {
    const device = { ...devices[deviceIndex], ...data }
    addDevice(device)
    res.status(201).send()
  }
  res.status(404).send()
}

function getDevices(req, res) {
  res.json(readDevices())
}

module.exports = {
  postDevice, getDevices,
}
