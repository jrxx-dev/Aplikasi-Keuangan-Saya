
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    const newLines = [];
    const keysSeen = new Set();

    // Process existing lines
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            newLines.push(line);
            continue;
        }

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            if (['BETTER_AUTH_URL', 'NEXT_PUBLIC_BETTER_AUTH_URL'].includes(key)) {
                // Skip existing config for these keys, we will append fresh ones
                continue;
            }
            if (!keysSeen.has(key)) {
                newLines.push(line);
                keysSeen.add(key);
            }
        } else {
            newLines.push(line);
        }
    }

    // Remove trailing empty lines
    while (newLines.length > 0 && newLines[newLines.length - 1].trim() === '') {
        newLines.pop();
    }

    // Append standard localhost:3000 config
    newLines.push('');
    newLines.push('# Auth Configuration (Reset via Agent)');
    newLines.push('BETTER_AUTH_URL=http://localhost:3000');
    newLines.push('NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000');

    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log('✅ .env cleaned and AUTH URLs reset to localhost:3000');

} catch (e) {
    console.error('Failed to fix .env', e);
}
