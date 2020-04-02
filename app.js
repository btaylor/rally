"use strict"

const { app, globalShortcut } = require('electron')

const MainWindow = require('./mainWindow.js')

class Application {
  constructor() {
    this.mainWindow = new MainWindow()

    app.whenReady().then(() => {
      this.mainWindow.initialize()

      this.registerGlobalKeyboardShortcuts()
    })

    app.on('window-all-closed', () => {
      this.unregisterGlobalKeyboardShortcuts()

      app.quit()
    })
  }

  registerGlobalKeyboardShortcuts() {
    this.registerGlobalKeyboardShortcut('CmdOrCtrl+Shift+D', () => {
      this.mainWindow.toggleMute()
    })

    this.registerGlobalKeyboardShortcut('CmdOrCtrl+Shift+E', () => {
      this.mainWindow.toggleCamera()
    })
  }

  registerGlobalKeyboardShortcut(keyCode, callback) {
    if (!globalShortcut.register(keyCode, callback)) {
      console.warn(`WARN: Registration of global keyboard shortcut (${keyCode}) failed`)
    }
  }

  unregisterGlobalKeyboardShortcuts() {
    globalShortcut.unregisterAll()
  }
}

new Application()
