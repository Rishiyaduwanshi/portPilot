import fs from 'fs-extra';
import path from 'path';
import Ajv from 'ajv';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


export async function validatePilotConfig(configPath) {
  const ajv = new Ajv({ allErrors: true });
  const schemaPath = path.join(__dirname,'./pilotrc.schema.json');

  try {
    const config = await fs.readJson(configPath);
    const schema = await fs.readJson(schemaPath);
    const validate = ajv.compile(schema);

    const valid = validate(config);

    if (!valid) {
      console.log(chalk.red('❌ pilotrc.json is invalid.'));
      for (const err of validate.errors) {
        console.log(chalk.yellow(`- ${err.instancePath || '/'} ${err.message}`));
      }
      process.exit(1);
    }

    return config; 
  } catch (err) {
    console.error(chalk.red(`❌ Failed to validate config: ${err.message}`));
    process.exit(1);
  }
}
