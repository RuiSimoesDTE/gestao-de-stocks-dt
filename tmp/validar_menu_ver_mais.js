const fs = require('fs');
const html = fs.readFileSync('gestao_armazem_catenaria.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(x => x[1]);
let valid = 0;
for (let i = 0; i < scripts.length; i++) {
  try { new Function(scripts[i]); valid++; }
  catch (error) {
    console.error(`SCRIPT ${i + 1}: ${error.message}`);
    process.exitCode = 1;
  }
}
const required = [
  'id="nav-more"', 'id="nav-more-toggle"',
  'data-v="encomendas"', 'data-v="movimentos"',
  'data-v="folha_consumos"', 'data-v="relatorios"',
  'data-v="sugestoes"', 'data-v="definicoes"'
];
for (const value of required) {
  if (!html.includes(value)) {
    console.error(`Em falta: ${value}`);
    process.exitCode = 1;
  }
}
console.log(`Scripts válidos: ${valid}/${scripts.length}`);
console.log(`Elementos do menu validados: ${required.length}/${required.length}`);
