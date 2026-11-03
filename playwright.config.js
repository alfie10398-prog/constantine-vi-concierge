import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.js',fullyParallel:false,workers:1,reporter:'list',
 use:{baseURL:'http://127.0.0.1:8787',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},
 projects:[{name:'iPhone',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}},{name:'Android',use:{...devices['Pixel 7']}},{name:'tablet',use:{viewport:{width:820,height:1180},hasTouch:true}},{name:'desktop',use:{viewport:{width:1440,height:1000}}}],
 webServer:{command:'npm run setup:local && node scripts/test-server.mjs',url:'http://127.0.0.1:8787',reuseExistingServer:false}
});
