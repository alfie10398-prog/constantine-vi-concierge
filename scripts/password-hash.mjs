// Supply a new host passphrase on stdin through a secure local terminal.
import {passwordHash} from '../server/worker.js';
let value='';for await(const chunk of process.stdin)value+=chunk;
value=value.trimEnd();if(value.length<16||value.length>256)throw Error('Use a unique passphrase of 16–256 characters.');
console.log(await passwordHash(value));
