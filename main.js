const { app, BrowserWindow } = require('electron')
const path = require("path");

const PY_FOLDER = "pyflask";
const PY_MODULE = "engine";

let pyProc = null;
const pyPort = "5000"; // Flask default port

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// check if the python dist folder exists
const getScriptPath = () => {
    //return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE);
    return path.join(__dirname, PY_FOLDER, PY_MODULE + ".py");
};
// create the python process
const createPyProc = () => {
    let script = getScriptPath();

    // pyProc = require("child_process").spawn("python", [script, pyPort], {
    //     stdio: "ignore",
    // });
    pyProc = require("child_process").spawn("python", ['-u', script, pyPort],
        {
            stdio: 'pipe',
            shell: false
        }
    );
    // pyProc.stdout.on('data', function (data) {
    //     console.log("pyProc.stdout: ", data.toString('utf8'));
    // });

    if (pyProc != null) {
        console.log("child process success on port " + pyPort);
        pyProc.stdout.on('data', function (data) {
            console.log("pyProc.stdout: ", data.toString('utf8'));
        });
        pyProc.stderr.on('data', (data) => {
            console.error(`pyProc stderr:\n${data}`);
        });

    } else {
        console.error("child process failed to start on port" + pyPort);
    }
};
// Close the webserver process on app exit
const exitPyProc = () => {
    console.log("exitPyProc ");
    pyProc.kill();
    pyProc = null;
    pyPort = null;
};

app.on("ready", createPyProc);
app.on("will-quit", exitPyProc);


function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        center: true,
        // webPreferences: {
        //     nodeIntegration: true,
        //     enableRemoteModule: true,
        //     contextIsolation: false,
        // },
    });

    // and load the index.html of the app.
    mainWindow.loadFile("index.html");

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== 'darwin') {
        console.log("Closing program.")
        app.quit()
    }
});