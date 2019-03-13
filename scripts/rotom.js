const shell = require('shelljs');

/**
 * A wrapper script so I don't have to make an npm command for every script I write
 * "RTM" for "React Translation Manager" or "rotom" cause I like Pokémon.
 */
const [cmd, ...opts] = process.argv.slice(2);

shell.exec(`node scripts/${cmd}.js ${opts.join(' ')}`);
