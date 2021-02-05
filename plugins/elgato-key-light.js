"use strict"

const elgato = require('elgato-light-api')

class ElgatoKeyLight {
  constructor() {
    this.light = new elgato.ElgatoLightAPI()
  }

  get status() {
    return this.light.keyLights[0].options.lights[0].on
  }

  on() {
    if (this.light.keyLights.length === 0) {
      return
    }

    let currentDate = new Date()
    let hours = currentDate.getHours()

    let brightness = 100

    if (hours > 14) {
      brightness = 50
    } else if (hours > 18) {
      brightness = 30
    }

    this.light.updateLightOptions(this.light.keyLights[0], {
      numberOfLights: 1, lights: [ { on: 1, brightness: brightness } ]
    })
  }

  off() {
    if (this.light.keyLights.length === 0) {
      return
    }

    this.light.updateLightOptions(this.light.keyLights[0], {
      numberOfLights: 1, lights: [ { on: 0 } ]
    })
  }

  toggle() {
    if (this.status) {
      this.off()
      return
    }

    this.on()
  }
}

class ElgatoKeyLightPlugin {
  constructor() {
    this.light = new ElgatoKeyLight()
  }

  menuItems() {
    return [
      { 
        label: 'Toggle Lights',
        accelerator: 'CmdOrCtrl+O',
        click: () => { this.light.toggle() }
      }
    ]
  }

  beginActiveCall() {
    this.light.on()
  }

  endActiveCall() {
    this.light.off()
  }
}

module.exports = ElgatoKeyLightPlugin
