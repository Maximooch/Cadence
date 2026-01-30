const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Keep a global reference of the window object
let mainWindow;

// Path to user data directory for storing schedule data
const userDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'Cadence');
const schedulePath = path.join(userDataPath, 'schedule.yml');

// Ensure user data directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Copy default schedule if user doesn't have one
if (!fs.existsSync(schedulePath)) {
  // Create default schedule
  const defaultSchedule = `# Cadence Scheduler Configuration
wake_time: 8.5   # 8:30am
sleep_time: 23   # 11:00pm

default_tasks:
  - id: 0
    name: "Deep Work Block 1"
    duration: 3
    color: "#2563eb"
  - id: 1
    name: "Deep Work Block 2"
    duration: 3
    color: "#0891b2"
  - id: 2
    name: "Admin & Planning"
    duration: 1
    color: "#059669"

days:
  friday:
    tasks:
      - id: 0
        name: "Weekly Review"
        duration: 2
        color: "#ea580c"
      - id: 1
        name: "Planning"
        duration: 1
        color: "#65a30d"
`;
  fs.writeFileSync(schedulePath, defaultSchedule);
  console.log('Created default schedule at:', schedulePath);
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: 'hiddenInset', // macOS style
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Handle window closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// IPC handlers for file operations
ipcMain.handle('get-schedule-path', () => {
  return schedulePath;
});

ipcMain.handle('read-schedule', async () => {
  try {
    const data = fs.readFileSync(schedulePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-schedule', async (event, content) => {
  try {
    fs.writeFileSync(schedulePath, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// macOS dock menu
if (process.platform === 'darwin') {
  app.dock.setMenu([
    {
      label: 'New Window',
      click() {
        createWindow();
      }
    }
  ]);
}