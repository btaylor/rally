"use strict"

const path = require('path')

const { app, screen, Menu, BrowserWindow } = require('electron')

const PluginManager = require('./pluginManager.js')

const NORMAL_WINDOW_SIZE = { width: 1778, height: 1000 }

const PIP_WINDOW_SIZE = { width: 640, height: 360 }
const PIP_INSETS = { x: 25, y: 25 }

class MainWindow {
  constructor() {
    this.browser = null
    this.pluginManager = new PluginManager()

    this.pictureInPicture = false
  }

  initialize() {
    this.browser = new BrowserWindow({
      width: NORMAL_WINDOW_SIZE.width,
      height: NORMAL_WINDOW_SIZE.height,
      title: app.name,
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })

    this.browser.webContents.on('did-finish-load', () => {
      if (this.hasActiveCall()) {
        this.pluginManager.beginActiveCall()
        return
      }

      this.pluginManager.endActiveCall()
    })

    this.browser.on('close', () => {
      this.pluginManager.appClosed()
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
    let template = [
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
      }
    ]

    var pluginMenuItems = this.pluginManager.menuItems()
    if (pluginMenuItems && pluginMenuItems.length > 0) {
      template.push({ label: 'Plugins', submenu: pluginMenuItems })
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
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
    this.browser.setVisibleOnAllWorkspaces(true)
    this.browser.setFullScreenable(false)
    this.browser.setWindowButtonVisibility(false);
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
    this.browser.setVisibleOnAllWorkspaces(false)
    this.browser.setFullScreenable(true)
    this.browser.setWindowButtonVisibility(true)
    this.browser.setIgnoreMouseEvents(false)

    this.pictureInPicture = false
  }

  navigateToLobby() {
    this.browser.loadURL('https://meet.google.com')
  }
}

module.exports = MainWindow
