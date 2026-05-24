const { spawn } = require('child_process');

function runProcess(name, dir, color) {
    const isWindows = process.platform === 'win32';
    const npmCommand = isWindows ? 'npm.cmd' : 'npm';

    console.log(`\x1b[${color}m[${name}] Starting...\x1b[0m`);

    const p = spawn(npmCommand, ['run', 'dev'], {
        cwd: dir,
        shell: true
    });

    p.stdout.on('data', (data) => {
        process.stdout.write(`\x1b[${color}m[${name}]\x1b[0m ${data}`);
    });

    p.stderr.on('data', (data) => {
        process.stderr.write(`\x1b[${color}m[${name} ERROR]\x1b[0m ${data}`);
    });

    p.on('close', (code) => {
        console.log(`\x1b[${color}m[${name}] Exited with code ${code}\x1b[0m`);
    });

    return p;
}

console.log("🚀 Starting workspace applications...");
const p1 = runProcess('FINANCE-APP', './finance-app', '36'); // Cyan
const p2 = runProcess('DASHBOARD', './main-dashboard', '35'); // Magenta

// Handle Ctrl+C properly
process.on('SIGINT', () => {
    console.log("\nStopping all workspace applications...");
    p1.kill('SIGINT');
    p2.kill('SIGINT');
    process.exit();
});
