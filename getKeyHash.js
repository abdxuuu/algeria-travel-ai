// getKeyHash.js - Run this to get Facebook Key Hash
const { execSync } = require('child_process');

console.log('🔑 Generating Facebook Key Hash for Android...');

try {
  // Method for Windows
  const keyHash = execSync(
    'keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\\.android\\debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64',
    { shell: true }
  ).toString().trim();
  
  console.log('✅ YOUR FACEBOOK KEY HASH IS:');
  console.log('📱', keyHash);
  console.log('\n📋 COPY THIS VALUE for Facebook Developer Console');
  
} catch (error) {
  console.log('❌ Could not generate key hash automatically.');
  console.log('📝 Manual method:');
  console.log('1. Open Command Prompt as Administrator');
  console.log('2. Run this command:');
  console.log('   keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\\.android\\debug.keystore | openssl sha1 -binary | openssl base64');
  console.log('3. When asked for password, enter: android');
}