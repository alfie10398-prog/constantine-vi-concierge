import {rm} from 'node:fs/promises';
await rm('.local/browser-tests.sqlite',{force:true});
process.env.LOCAL_DB='.local/browser-tests.sqlite';
await import('../server/local.mjs');
