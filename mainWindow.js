"use strict"

const { app, screen, Menu, BrowserWindow } = require('electron')

const Light = require('./light.js')

const NORMAL_WINDOW_SIZE = { width: 1778, height: 1000 }

const PIP_WINDOW_SIZE = { width: 640, height: 360 }
const PIP_INSETS = { x: 25, y: 25 }

class MainWindow {
  constructor() {
    this.browser = null
    this.light = new Light()

    this.pictureInPicture = false
  }

  initialize() {
    this.browser = new BrowserWindow({
      width: NORMAL_WINDOW_SIZE.width,
      height: NORMAL_WINDOW_SIZE.height,
      title: app.name,
      titleBarStyle: 'hidden'
    })

    this.browser.webContents.on('did-finish-load', () => {
      if (this.hasActiveCall()) {
        this.light.on()
        return
      }

      this.light.off()
    })

    this.browser.on('close', () => {
      this.light.off()
    })

    this.browser.on('blur', () => {
      // Animate to PIP only if there's an active call
      if (this.hasActiveCall()) {
        this.presentPictureInPicture()
      }
    })

    this.browser.on('focus', () => {
      this.dismissPictureInPicture()
    })

    this.navigateToLobby()

    this.createMenu()
  }

  createMenu() {
    let menu = Menu.buildFromTemplate([
      { role: 'appMenu' },
      {
        label: 'Navigate',
        submenu: [
          {
            label: 'Back to Lobby',
            accelerator: 'CmdOrCtrl+L',
            click: () => { this.navigateToLobby() }
          }
        ]
      },
      {
        label: 'Lights',
        submenu: [
          {
            label: 'Toggle lights',
            accelerator: 'CmdOrCtrl+O',
            click: () => { this.light.toggle() }
          }
        ]
      }
    ])

    Menu.setApplicationMenu(menu)
  }

  hasActiveCall() {
    return this.browser.getURL()
                       .match(/https:\/\/meet\.google\.com\/(_meet\/)?\w+-\w+-\w+/)
  }

  presentPictureInPicture() {
    let display = screen.getDisplayNearestPoint(this.browser.getBounds())
    let workArea = display.workArea

    this.browser.setBounds({
      x: Math.floor(workArea.x + PIP_INSETS.x),
      y: Math.floor(workArea.y + PIP_INSETS.y),
      width: PIP_WINDOW_SIZE.width,
      height: PIP_WINDOW_SIZE.height
    }, true)

    this.browser.setAlwaysOnTop(true, 'floating')
    this.browser.setWindowButtonVisibility(false)
    this.browser.setIgnoreMouseEvents(true)

    this.pictureInPicture = true
  }

  dismissPictureInPicture() {
    let display = screen.getDisplayNearestPoint(this.browser.getBounds())
    let workArea = display.workArea

    this.browser.setBounds({
      x: Math.floor(workArea.x + (workArea.width / 2) - (NORMAL_WINDOW_SIZE.width / 2)),
      y: Math.floor(workArea.y + (workArea.height / 2) - (NORMAL_WINDOW_SIZE.height / 2)),
      width: NORMAL_WINDOW_SIZE.width,
      height: NORMAL_WINDOW_SIZE.height
    }, true)

    this.browser.setAlwaysOnTop(false)
    this.browser.setWindowButtonVisibility(true)
    this.browser.setIgnoreMouseEvents(false)

    this.pictureInPicture = false
  }

  navigateToLobby() {
    this.browser.loadURL('https://meet.google.com')
  }
}

module.exports = MainWindow
