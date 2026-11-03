import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',fullyParallel:true,reporter:'list',
 use:{baseURL:'http://127.0.0.1:4173',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},
 projects:[
  {name:'iPhone',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}},
  {name:'tablet',use:{viewport:{width:820,height:1180},isMobile:true,hasTouch:true}},
  {name:'desktop',use:{viewport:{width:1440,height:1000}}}
 ],
 webServer:{command:'npm run preview -- --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}
});
