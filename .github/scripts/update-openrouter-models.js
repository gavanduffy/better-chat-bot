const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { load } = require('js-yaml');  // npm install js-yaml for safer parsing, but since it's JS object, use regex

const MODELS_FILE = path.join(__dirname, '..', '..', 'src', 'lib', 'ai', 'models.ts');

async function main() {
  // Fetch OpenRouter models
  const response = await axios.get('https://openrouter.ai/api/v1/models');
  const models = response.data.data;

  // Filter free models: prompt and completion pricing == "0"
  const freeModels = models
    .filter(model => model.pricing.prompt === '0' && model.pricing.completion === '0')
    .filter(model => {
      // Focus on :free or openrouter/ prefixed, or popular ones
      const id = model.id;
      return id.endsWith(':free') || id.startsWith('openrouter/') || 
             ['qwen/', 'deepseek/', 'google/', 'z-ai/', 'moonshotai/', 'kwaipilot/', 'mistralai/'].some(prefix => id.startsWith(prefix));
    })
    .map(model => {
      const key = model.id.split('/').pop();
      return { key, id: model.id };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  // Read current models.ts
  let content = fs.readFileSync(MODELS_FILE, 'utf8');

  // Extract current openRouter keys using regex
  const currentKeysMatch = content.match(/openRouter:\s*\{([^}]+)\}/s);
  if (!currentKeysMatch) {
    console.error('Could not find openRouter object');
    process.exit(1);
  }
  const currentBlock = currentKeysMatch[1];
  const currentKeys = new Set();
  currentBlock.split('\n').forEach(line => {
    const match = line.match(/"([^"]+)":/);
    if (match) currentKeys.add(match[1]);
  });

  // Find new models
  const newModels = freeModels.filter(m => !currentKeys.has(m.key));

  if (newModels.length === 0) {
    console.log('No new models found.');
    process.exit(0);
  }

  console.log(`Found ${newModels.length} new models:`, newModels.map(m => m.key));

  // Generate new lines
  const newLines = newModels.map(m => `    "${m.key}": openrouter("${m.id}"),`);

  // Insert into the block, sorted
  const allKeys = Array.from(currentKeys).concat(newModels.map(m => m.key)).sort();
  const newBlockLines = allKeys.map(key => {
    if (currentKeys.has(key)) {
      // Keep existing line
      const existingLine = currentBlock.split('\n').find(line => line.includes(`"${key}":`));
      return existingLine;
    } else {
      const model = freeModels.find(m => m.key === key);
      return `    "${key}": openrouter("${model.id}"),`;
    }
  }).join('\n');

  const newOpenRouterBlock = `  openRouter: {\n${newBlockLines}\n  },`;

  // Replace the old block
  content = content.replace(/openRouter:\s*\{[^}]*\}/s, newOpenRouterBlock);

  // Also add to staticUnsupportedModels if similar to existing free ones
  const unsupportedMatch = content.match(/staticUnsupportedModels = new Set\([^)]*\)/s);
  if (unsupportedMatch) {
    let unsupportedBlock = unsupportedMatch[0];
    newModels.forEach(m => {
      unsupportedBlock += `\n  staticModels.openRouter["${m.key}"],`;
    });
    content = content.replace(/staticUnsupportedModels = new Set\([^)]*\)/s, unsupportedBlock);
  }

  fs.writeFileSync(MODELS_FILE, content);

  console.log('Updated models.ts with new models.');
  process.stdout.write('has-changes=true');
}

main().catch(console.error);