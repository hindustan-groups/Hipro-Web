const fs = require('fs');
const path = require('path');

const dirs = ['app/admin', 'components/admin'];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Fix the double replacement
            content = content.replace(/rounded-none-none/g, 'rounded-none');
            content = content.replace(/rounded-none-full/g, 'rounded-full');
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed ' + fullPath);
            }
        }
    }
}

dirs.forEach(processDir);
