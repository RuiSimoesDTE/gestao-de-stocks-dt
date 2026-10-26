import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync("gestao_armazem_catenaria.html","utf8");
const scripts=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]);
const scriptErrors=[];
scripts.forEach((script,index)=>{
  try{new vm.Script(script,{filename:`inline-${index+1}.js`});}
  catch(error){scriptErrors.push(error.message);}
});
const targets=[...source.matchAll(/data-v="([^"]+)"/g)].map(match=>match[1]);
const uniqueTargets=[...new Set(targets)];
const missingViews=uniqueTargets.filter(view=>!source.includes(`id="view-${view}"`));
console.log(JSON.stringify({
  scripts:scripts.length,
  scriptErrors,
  navTargets:uniqueTargets,
  missingViews,
  sectionsOpen:(source.match(/<section\b/g)||[]).length,
  sectionsClose:(source.match(/<\/section>/g)||[]).length
},null,2));
