const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Building project...');
execSync('npx expo export -p web', { stdio: 'inherit' });

console.log('🔧 Fixing ALL paths in index.html...');
let html = fs.readFileSync('./dist/index.html', 'utf8');

// Fix JavaScript paths
html = html.replace(/src="\/_expo/g, 'src="/Apollo18TokenAPP/_expo');

// Add favicon with correct path
html = html.replace('<head>', '<head><link rel="icon" href="/Apollo18TokenAPP/favicon.ico" />');

fs.writeFileSync('./dist/index.html', html);
console.log('✅ Paths fixed!');

console.log('📁 Ensuring favicon exists...');
fs.copyFileSync('./assets/logo.png', './dist/favicon.ico');

console.log('📤 Deploying fixed version...');
execSync('npx gh-pages -d dist --nojekyll --dotfiles', { stdio: 'inherit' });

console.log('🎉 DEPLOYMENT COMPLETE!');
console.log('⏰ Wait 3-5 minutes, then test:');
console.log('   📱 App: https://apolloat2022.github.io/Apollo18TokenAPP/');
console.log('   🔗 JS: https://apolloat2022.github.io/Apollo18TokenAPP/_expo/static/js/web/');
console.log('   🖼️ Favicon: https://apolloat2022.github.io/Apollo18TokenAPP/favicon.ico');
