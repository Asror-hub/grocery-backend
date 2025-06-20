const fs = require('fs');
const path = require('path');

// List of model variable names to check for null
const modelVars = ['admin', 'order', 'user', 'notification', 'customer'];

function fixNullChecksInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  modelVars.forEach(varName => {
    // Regex to find: const varName = await ...;
    const regex = new RegExp(`(const|let) ${varName} = await [^;]+;`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Check if there is already a null check for this variable
      const after = content.slice(match.index + match[0].length, match.index + match[0].length + 200);
      const nullCheckRegex = new RegExp(`if \(!${varName}\) {`);
      if (!nullCheckRegex.test(after)) {
        // Insert null check after the variable declaration
        const insertIndex = match.index + match[0].length;
        const nullCheck = `\nif (!${varName}) {\n  res.status(404).json({ message: '${capitalize(varName)} not found' });\n  return;\n}\n`;
        content = content.slice(0, insertIndex) + nullCheck + content.slice(insertIndex);
        modified = true;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed null checks in: ${filePath}`);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fixNullChecksInFile(filePath);
    }
  });
}

processDirectory('./src');
console.log('Finished fixing null checks!'); 