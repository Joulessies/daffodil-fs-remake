const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'node_modules', '@clerk', 'expo', 'dist', 'specs', 'NativeClerkModule.android.js'),
  path.join(__dirname, '..', 'node_modules', '@clerk', 'expo', 'dist', 'specs', 'NativeClerkGoogleSignIn.android.js'),
];

for (const filePath of filesToPatch) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('(0, expo.requireNativeModule)')) {
      const patched = content.replace('(0, expo.requireNativeModule)', '(0, expo.requireOptionalNativeModule)');
      fs.writeFileSync(filePath, patched, 'utf8');
      console.log(`[patch-clerk] Patched ${path.basename(filePath)} for Expo Go compatibility`);
    }
  }
}

