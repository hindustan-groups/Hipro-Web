const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('route.ts') || fullPath.endsWith('route.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('force-dynamic')) {
                // Add export const dynamic = "force-dynamic"; below the imports
                const lines = content.split('\n');
                let lastImportIdx = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('import ')) {
                        lastImportIdx = i;
                    }
                }
                lines.splice(lastImportIdx + 1, 0, '\nexport const dynamic = "force-dynamic";');
                fs.writeFileSync(fullPath, lines.join('\n'));
                console.log('Added force-dynamic to ' + fullPath);
            }
        }
    }
}

processDir('app/api');
