/* eslint-env node */
const fs = require('fs');
const path = require('path');

function renameFilesToJs(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      renameFilesToJs(filePath);
    } else if (!file.endsWith('.js') && !file.endsWith('.json') && !file.includes('.')) {
      // This is likely a compiled TypeScript file without extension
      const newFilePath = filePath + '.js';
      fs.renameSync(filePath, newFilePath);
      console.log(`Renamed: ${filePath} -> ${newFilePath}`);
    }
  });
}

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix relative imports starting with ./
      const newContent1 = content.replace(
        /from\s+["']\.\/([^"']+?)(?<!\.js)["']/g, 
        'from "./$1.js"'
      );
      if (newContent1 !== content) {
        content = newContent1;
        modified = true;
      }
      
      // Fix relative imports starting with ../
      const newContent2 = content.replace(
        /from\s+["']\.\.\/([^"']+?)(?<!\.js)["']/g, 
        'from "../$1.js"'
      );
      if (newContent2 !== content) {
        content = newContent2;
        modified = true;
      }
      
      // Fix import statements (not just from)
      const newContent3 = content.replace(
        /import\s+["']\.\/([^"']+?)(?<!\.js)["']/g, 
        'import "./$1.js"'
      );
      if (newContent3 !== content) {
        content = newContent3;
        modified = true;
      }
      
      const newContent4 = content.replace(
        /import\s+["']\.\.\/([^"']+?)(?<!\.js)["']/g, 
        'import "../$1.js"'
      );
      if (newContent4 !== content) {
        content = newContent4;
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed imports in: ${filePath}`);
      }
    }
  });
}

console.log('Starting file renaming...');
renameFilesToJs('./dist');
console.log('File renaming completed!');

console.log('Starting import fixes...');
fixImports('./dist');
console.log('Import fixes completed!');