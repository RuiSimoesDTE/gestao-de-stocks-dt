import fs from "node:fs";
const h=fs.readFileSync("gestao_armazem_catenaria.html","utf8");
const scripts=[...h.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
let ok=0;
for(let i=0;i<scripts.length;i++){
  try{new Function(scripts[i]);ok++;}
  catch(e){console.error(`SCRIPT ${i+1}: ${e.message}`);process.exitCode=1;}
}
const ids=[...h.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
const duplicateIds=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
const checks={scriptsCompiled:ok,totalScripts:scripts.length,duplicateIds,suggestionsNav:h.includes('data-v="sugestoes"'),suggestionsView:h.includes('id="view-sugestoes"'),emailCount:(h.match(/rui\.simoes@dte\.pt/g)||[]).length,mailto:h.includes("mailto:"),backup:fs.existsSync("gestao_armazem_catenaria.html.backup_antes_sugestoes_20260716")};
console.log(JSON.stringify(checks,null,2));
if(duplicateIds.length||!checks.suggestionsNav||!checks.suggestionsView||!checks.mailto||!checks.backup)process.exitCode=1;
