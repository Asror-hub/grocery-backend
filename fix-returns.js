const fs = require('fs');
const path = require('path');

function fixReturnsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix return res.status() statements
    const returnResPattern = /(\s+)return\s+res\.status\(/g;
    if (returnResPattern.test(content)) {
      content = content.replace(returnResPattern, '$1res.status(');
      modified = true;
    }

    // Add Promise<void> return types to async functions
    const asyncFuncPattern = /export const (\w+) = async \(req: Request, res: Response\) => {/g;
    if (asyncFuncPattern.test(content)) {
      content = content.replace(asyncFuncPattern, 'export const $1 = async (req: Request, res: Response): Promise<void> => {');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fixReturnsInFile(filePath);
    }
  });
}

// Process src directory
processDirectory('./src');
console.log('Finished fixing return statements!'); 