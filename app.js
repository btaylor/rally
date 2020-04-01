"use strict"

const { app } = require('electron')

const MainWindow = require('./mainWindow.js')

let mainWindow = new MainWindow()
app.whenReady().then(() => {
  mainWindow.initialize()
})

app.on('window-all-closed', () => {
  app.quit()
})
