const { execSync } = require('child_process');
const fs = require('fs');

try {
    console.log('Running Maven compile...');
    const output = execSync('..\\\\dashboard-sidsic-backend\\\\mvnw.cmd -f ..\\\\dashboard-sidsic-backend\\\\pom.xml clean compile', { encoding: 'utf-8' });
    fs.writeFileSync('compile-output.log', output);
    console.log('Compilation successful. Log saved to compile-output.log');
} catch (error) {
    console.log('Compilation failed. Saving error log to compile-output.log');
    fs.writeFileSync('compile-output.log', error.stdout ? error.stdout.toString() : error.message);
}
