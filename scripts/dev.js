import { spawn } from "node:child_process";

console.log("\x1b[36m[ChatLive]\x1b[0m Starting Backend Server (port 5001) & Frontend Client...");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

const serverProcess = spawn(npmCmd, ["run", "dev:server"], {
  stdio: "inherit",
  shell: true,
});

const clientProcess = spawn(npmCmd, ["run", "dev:client"], {
  stdio: "inherit",
  shell: true,
});

function cleanup() {
  console.log("\n\x1b[33m[ChatLive]\x1b[0m Shutting down dev servers...");
  try {
    serverProcess.kill();
  } catch {}
  try {
    clientProcess.kill();
  } catch {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
