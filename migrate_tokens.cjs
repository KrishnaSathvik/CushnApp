const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, 'src');

const replacements = {
    // Backgrounds
    'T.bg': 'T.bgBase',
    'bg-bg': 'bg-bgBase', // For Tailwind classes if any
    'T.surface': 'T.bgSurface',
    'T.elevated': 'T.bgElevated',
    'T.hover': 'T.bgHover',
    'T.glassStrong': 'T.bgGlassStrong',
    'T.glass': 'T.bgGlass',
    // Text
    'T.white': 'T.fgPrimary',
    'text-white': 'text-fgPrimary',
    'T.gray1': 'T.fgSecondary',
    'T.gray2': 'T.fgSecondary',
    'T.gray3': 'T.fgTertiary',
    'T.gray4': 'T.fgDivider',
    // Accents
    'T.accentLt': 'T.accentStrong',
    'T.accentDim': 'T.accentSoft',
    'T.accent': 'T.accentPrimary', // Note: Must run after accentLt/Dim
    // Warm Accents
    'T.warmLt': 'T.accentWarmStrong',
    'T.warmDim': 'T.accentWarmSoft',
    'T.warm': 'T.accentWarm',
    // Semantic
    'T.green': 'T.semSuccess',
    'T.red': 'T.semDanger',
    'T.amber': 'T.semWarning',
    'T.blue': 'T.semInfo',
    'T.purple': 'T.semCloud',
};

// Ensure order matters for partial matches (e.g. T.accent before T.accentLt)
const orderedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

glob(`${SRC_DIR}/**/*.jsx`, (err, files) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    let changedFiles = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;

        for (const key of orderedKeys) {
            // Use regex with word boundaries to avoid replacing "T.bgelevated" again
            // Escape dots in key: T.bg -> T\.bg
            const escapedKey = key.replace(/\./g, '\\.');
            const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
            newContent = newContent.replace(regex, replacements[key]);
        }

        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated ${path.relative(__dirname, file)}`);
            changedFiles++;
        }
    }

    console.log(`\nCompleted. Updated ${changedFiles} files.`);
});
