"use strict"

const path = require('path')

const { app, screen, globalShortcut, Menu, BrowserWindow } = require('electron')

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

      this.unregisterGlobalKeyboardShortcut()
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

    this.registerGlobalKeyboardShortcut()
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
          },
          {
            label: 'Open Developer Tools',
            accelerator: 'CmdOrCtrl+Option+I',
            click: () => {
              console.log("Open Developer Tools")
              this.browser.webContents.openDevTools()
            }
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

  registerGlobalKeyboardShortcut() {
    const ret = globalShortcut.register('CmdOrCtrl+Shift+D', () => {
      this.toggleMute()
    })

    if (!ret) {
      console.warn('WARN: Registration of global keyboard shortcut (CmdOrCtrl+Shift+D) failed')
    }
  }

  unregisterGlobalKeyboardShortcut() {
    globalShortcut.unregisterAll()
  }

  hasActiveCall() {
    return this.browser.getURL()
                       .match(/https:\/\/meet\.google\.com\/(_meet\/)?\w+-\w+-\w+/)
  }

  toggleMute() {
    this.browser.webContents.executeJavaScript(`
      var offButton = document.querySelector('[aria-label="Turn off microphone (⌘ + d)"]')
      var onButton = document.querySelector('[aria-label="Turn on microphone (⌘ + d)"]')

      if (offButton) {
        offButton.click()
      } else if (onButton) {
        onButton.click()
      }
    `)
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
