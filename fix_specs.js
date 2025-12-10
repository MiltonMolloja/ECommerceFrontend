const fs = require('fs');

const filePath = 'src/app/features/product-detail/components/product-specifications/product-specifications.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic return statement
content = content.replace(
  "return unit ? `${number} ${unit}` : number;",
  "return unit ? `${number} ${unit}` : String(number);"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully');
