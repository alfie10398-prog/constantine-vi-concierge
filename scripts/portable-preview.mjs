// A self-contained review file that needs no hosting or public URL.
import {readFile,writeFile,readdir} from 'node:fs/promises';
let html=await readFile('dist/index.html','utf8');
const entries=await readdir('dist/assets');
const script=await readFile(`dist/assets/${entries.find(f=>f.endsWith('.js'))}`,'utf8');
const css=await readFile(`dist/assets/${entries.find(f=>f.endsWith('.css'))}`,'utf8');
const lookup=Object.fromEntries(await Promise.all(entries.filter(f=>/\.(png|jpg)$/.test(f)).map(async f=>[f,`data:${f.endsWith('.png')?'image/png':'image/jpeg'};base64,${(await readFile(`dist/assets/${f}`)).toString('base64')}`])));
html=html.replace(/<script type="module"[^>]*><\/script>/,'').replace(/<link rel="stylesheet"[^>]*>/,'');
html=html.replace('</head>',`<style>${css}</style></head>`).replace('</body>',`<script>globalThis.__PORTABLE_ASSETS__=${JSON.stringify(lookup)};${script.replaceAll('</script','<\\/script')}</script></body>`);
await writeFile('dist/Constantine-VI-Private-Preview.html',html);
