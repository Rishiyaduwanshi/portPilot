import fs from 'fs-extra';
import path from 'path';
import Ajv from 'ajv';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function validatePilotConfig(configPath) {
  const ajv = new Ajv({ allErrors: true });
  const schemaPath = path.join(__dirname, './pilotrc.schema.json');

  let config;

  try {
    config = await fs.readJson(configPath);
  } catch (err) {
    console.error(chalk.red(`\u274C Invalid JSON in .pilotrc.json`));
    console.error(chalk.yellow('\u27A1\uFE0F Please fix your JSON syntax.'));
    console.error(chalk.gray(err.message));
    process.exit(1);
  }

  let schema;
  try {
    schema = await fs.readJson(schemaPath);
  } catch (err) {
    console.error(chalk.red(`\u274C Failed to load schema: ${err.message}`));
    process.exit(1);
  }

  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (!valid) {
    console.log(
      chalk.red('\u274C .pilotrc.json does not match expected schema.')
    );
    for (const err of validate.errors) {
      console.log(chalk.yellow(`- ${err.instancePath || '/'} ${err.message}`));
    }
    process.exit(1);
  }

  return config;
}
