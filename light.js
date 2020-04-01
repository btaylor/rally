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

module.exports = Light
