const express = require('express')
const os = require('os')

const router = express.Router()
let previousCpu = null

function readCpuTimes() {
  return os.cpus().reduce(
    (totals, cpu) => {
      const times = cpu.times
      totals.total += times.user + times.nice + times.sys + times.irq + times.idle
      totals.idle += times.idle
      return totals
    },
    { total: 0, idle: 0 },
  )
}

router.get('/', (req, res) => {
  const currentCpu = readCpuTimes()
  let cpuPercent = 0

  if (previousCpu) {
    const totalDelta = currentCpu.total - previousCpu.total
    const idleDelta = currentCpu.idle - previousCpu.idle
    cpuPercent = totalDelta > 0 ? ((totalDelta - idleDelta) / totalDelta) * 100 : 0
  }

  previousCpu = currentCpu

  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  const usedMemory = totalMemory - freeMemory

  res.json({
    cpu: Number(Math.min(100, Math.max(0, cpuPercent)).toFixed(1)),
    ram: Number(((usedMemory / totalMemory) * 100).toFixed(1)),
    usedMemory,
    totalMemory,
    uptime: os.uptime(),
    hostname: os.hostname(),
  })
})

module.exports = router
