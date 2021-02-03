"use strict"

const LifxClient = require('node-lifx').Client

const ON_HOURS_MIN = 8 // Turn on before 8am
const ON_HOURS_MAX = 18 // Turn on after 6pm
const FADE_DURATION = 2000
const HEX_COLORS = [
  '#19DD89', // Blue / Green
  '#C3FF68', // Neon Green / Yellow
  '#FBB829', // Heart of Gold
  '#D31996', // Purple
  '#BAE4E5', // Robin's Egg
  '#00B4FF', // Hot Blue,
  '#FFFC7F' // Soft yellow
]


class Lifx {
  constructor() {
    this.client = new LifxClient()
    this.client.init({
      startDiscovery: true
    })
  }

  toggle() {
    let lights = this.client.lights()
    for (let i in lights) {
      let light = lights[i]
      light.getState((err, data) => {
        if (data.power === 0) {
          light.on(FADE_DURATION)
        } else {
          light.off(FADE_DURATION)
        }
      })
    }
  }

  on() {
    let lights = this.client.lights()
    for (let i in lights) {
      let light = lights[i]
      light.on(FADE_DURATION, (err) => {
        let randomColor = HEX_COLORS[
          Math.floor(Math.random() * HEX_COLORS.length)
        ]
        light.colorRgbHex(randomColor, 500)
      })
    }
  }

  off() {
    let lights = this.client.lights()
    for (let i in lights) {
      let light = lights[i]
      light.off(FADE_DURATION)
    }
  }
}

class LifxPlugin {
  constructor() {
    this.lifx = new Lifx()
  }

  menuItems() {
    return [
      {
        label: 'Toggle Mood Lights',
        accelerator: 'CmdOrCtrl+M',
        click: () => { this.lifx.toggle() }
      },
      {
        label: 'Randomize Mood Lights',
        accelerator: 'CmdOrCtrl+Shift+M',
        click: () => { this.lifx.on() }
      }
    ]
  }

  beginActiveCall() {
    let currentDate = new Date()

    let hours = currentDate.getHours()
    if (hours < ON_HOURS_MIN || hours > ON_HOURS_MAX) {
      this.lifx.on()
    }
  }

  endActiveCall() {
    this.lifx.off()
  }
}

module.exports = LifxPlugin
