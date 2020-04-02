"use strict"

const elgato = require('elgato-light-api')

class Light {
  constructor() {
    this.light = new elgato.ElgatoLightAPI()
  }

  get status() {
    return this.light.keyLights[0].options.lights[0].on
  }

  on() {
    this.light.updateLightOptions(this.light.keyLights[0], {
      numberOfLights: 1, lights: [ { on: 1 } ]
    })
  }

  off() {
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

class LightPlugin {
  constructor() {
    this.light = new Light()
  }

  menuItems() {
    return [
      { 
        label: 'Toggle lights',
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

module.exports = LightPlugin
