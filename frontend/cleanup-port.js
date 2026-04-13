// cleanup-port.js
// This script kills any process using port 3000 before starting the dev server
const { execSync } = require('child_process');
const os = require('os');

const PORT = 3000;

try {
  if (os.platform() === 'win32') {
    // Windows
    console.log(`🧹 Cleaning up port ${PORT} on Windows...`);
    try {
      const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf-8' });
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));
      
      if (lines.length > 0) {
        const pidMatch = lines[0].match(/\s(\d+)\s*$/);
        if (pidMatch) {
          const pid = pidMatch[1];
          console.log(`⚠️  Found process ${pid} using port ${PORT}`);
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
          console.log(`✅ Killed process ${pid}`);
        }
      }
    } catch (err) {
      // No process found, that's fine
      console.log(`✅ Port ${PORT} is free`);
    }
  } else {
    // Mac/Linux
    console.log(`🧹 Cleaning up port ${PORT} on Unix...`);
    try {
      execSync(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null`, { stdio: 'pipe' });
      console.log(`✅ Cleaned up port ${PORT}`);
    } catch (err) {
      console.log(`✅ Port ${PORT} is free`);
    }
  }
  
  console.log(`🚀 Ready to start app on port ${PORT}\n`);
} catch (error) {
  console.error('Error during cleanup:', error.message);
  process.exit(1);
}
