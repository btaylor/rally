"use strict"

const spotify = require('spotify-node-applescript')

class SpotifyPlugin {
  constructor() {
    this.previouslyPaused = false
  }

  menuItems() {
    return []
  }

  beginActiveCall() {
    spotify.getState((err, state) => {
      if (state === undefined) {
        console.error('SpotifyPlugin: error: state could not be determined')
        return
      }

      this.previouslyPaused = (state.state === 'playing')
      if (this.previouslyPaused) {
        spotify.pause()
      }
    })
  }

  endActiveCall() {
    if (this.previouslyPaused) {
      spotify.play()
    }
  }
}

module.exports = SpotifyPlugin
