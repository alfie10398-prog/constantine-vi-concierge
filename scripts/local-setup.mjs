import {mkdir,writeFile,access} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {passwordHash} from '../server/worker.js';
await mkdir('.local',{recursive:true});
try{await access('.local/secrets.json');console.log('Local credentials already exist; preserved.');process.exit(0);}catch{}
const password=randomBytes(24).toString('base64url');
await writeFile('.local/secrets.json',JSON.stringify({SESSION_SECRET:randomBytes(32).toString('hex'),ADMIN_PASSWORD_HASH:await passwordHash(password)}),{mode:0o600,flag:'wx'});
await writeFile('.local/host-password.txt',password+'\n',{mode:0o600,flag:'wx'});
console.log('Created local-only random credentials. Host password is in ignored .local/host-password.txt. Do not commit or share it.');
