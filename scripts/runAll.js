/**
 * Run [command] on the given [configFile] on all languages in the given [langDir]
 *
 * ```
 * runAll [command] [configfile] [langDir]
 * ```
 */
const fs = require('fs');
const shell = require('shelljs');
const [cmd, configFile, langsDir] = process.argv.slice(2);
const langFiles = fs.readdirSync(langsDir);

// We run the script separately for each language so that the shelljs global state
// (e.g. working directory) doesn't interfere between runs
langFiles.forEach(langFile => {
  const path = `${langsDir}/${langFile}`;
  shell.exec(`node scripts/${cmd}.js ${configFile} ${path}`, {async: true});
});
