"use strict"

const path = require('path')

const { app, screen, shell, Menu, BrowserWindow } = require('electron')

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

    this.browser.webContents.on('new-window', (err, url) => {
      err.preventDefault()

      shell.openExternal(url)
    })

    this.browser.on('close', () => {
      this.pluginManager.appClosed()
    })

    this.browser.on('blur', () => {
      // Animate to PIP only if there's an active call
      if (this.hasActiveCall() && !this.isDevToolsOpened()) {
        this.presentPictureInPicture()
      }
    })

    this.browser.on('focus', () => {
      this.dismissPictureInPicture()
    })

    this.createMenu()

    this.home()
  }

  createMenu() {
    let template = [
      { role: 'appMenu' },
      {
        label: 'Call',
        submenu: [
          {
            label: 'Toggle Mute',
            accelerator: 'CmdOrCtrl+Shift+D',
            click: () => this.toggleMute()
          },
          {
            label: 'Toggle Camera',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => this.toggleCamera()
          },
          { type: 'separator' },
          {
            label: 'Leave Call',
            accelerator: 'CmdOrCtrl+L',
            click: () => {
              if (!this.hasActiveCall()) {
                this.home()
                return
              }

              this.leaveCall()
              setTimeout(() => this.home(), 2000)
            }
          },
        ]
      },
      { role: 'editMenu' },
      {
        label: 'View',
        submenu: [
          {
            label: 'Open Attachment',
            accelerator: 'CmdOrCtrl+A',
            click: () => this.openFirstAttachment()
          },
          {
            label: 'Toggle Grid',
            accelerator: 'CmdOrCtrl+G',
            click: () => this.toggleGrid()
          },
          { type: 'separator' },
          {
            label: 'Open Developer Tools',
            accelerator: 'CmdOrCtrl+Option+I',
            click: () => this.browser.webContents.openDevTools()
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

  isDevToolsOpened() {
    return this.browser.webContents.isDevToolsOpened()
  }

  toggleMute() {
    this.browser.webContents.executeJavaScript(`
      var onButton = document.querySelector('[aria-label="Turn on microphone (⌘ + d)"]')
      var offButton = document.querySelector('[aria-label="Turn off microphone (⌘ + d)"]')

      if (onButton) {
        onButton.click()
      } else if (offButton) {
        offButton.click()
      }
    `)
  }

  toggleCamera() {
    this.browser.webContents.executeJavaScript(`
      var onButton = document.querySelector('[aria-label="Turn on camera (⌘ + e)"]')
      var offButton = document.querySelector('[aria-label="Turn off camera (⌘ + e)"]')

      if (onButton) {
        onButton.click()
      } else if (offButton) {
        offButton.click()
      }
    `)
  }

  leaveCall() {
    this.browser.webContents.executeJavaScript(`
      var leaveCallButton = document.querySelector('[aria-label="Leave call"]')
      if (leaveCallButton) {
        leaveCallButton.click()
      }
    `)
  }

  toggleGrid() {
    this.browser.webContents.executeJavaScript(`
      var toggleGridButton = document.querySelector('[aria-label="Toggle grid"]')
      if (toggleGridButton) {
        toggleGridButton.click()
      }
    `)
  }

  openFirstAttachment() {
    this.browser.webContents.executeJavaScript(`
      new Promise((resolve) => {
        var detailsButton = document.querySelector('[aria-label$="This meeting has attachments."]')
        if (!detailsButton) {
          resolve()
          return
        }

        detailsButton.click()
        setTimeout(() => resolve(), 200)
      }).then(() => {
        return new Promise((resolve) => {
          var attachmentsContainer = document.querySelector('[aria-label="Attachments"]')
          if (!attachmentsContainer) {
            resolve()
            return
          }

          var attachment = attachmentsContainer.querySelector('[data-file-url]')
          var fileURL = attachment.getAttribute('data-file-url')
          setTimeout(() => resolve(fileURL), 300)
        })
      }).then((fileURL) => {
        var detailsButton = document.querySelector('[aria-label$="This meeting has attachments."]')
        if (detailsButton) {
          detailsButton.click()
        }
        return fileURL;
      })
    `).then((fileURL) => {
      if (!fileURL) {
        return
      }

      shell.openExternal(fileURL)
    })
  }

  home() {
    this.browser.loadURL('https://meet.google.com')
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

    this.pictureInPicture = true
  }

  dismissPictureInPicture() {
    let display = screen.getDisplayNearestPoint(this.browser.getBounds())
    let workArea = display.workArea

    this.browser.setBounds({
      x: Math.round((workArea.width / 2) - (NORMAL_WINDOW_SIZE.width / 2) + workArea.x),
      y: Math.round((workArea.height / 2) - (NORMAL_WINDOW_SIZE.height / 2) + workArea.y - 13),
      width: NORMAL_WINDOW_SIZE.width,
      height: NORMAL_WINDOW_SIZE.height
    }, true)

    this.browser.setAlwaysOnTop(false)
    this.browser.setVisibleOnAllWorkspaces(false)
    this.browser.setFullScreenable(true)
    this.browser.setWindowButtonVisibility(true)

    this.pictureInPicture = false
  }
}

module.exports = MainWindow
