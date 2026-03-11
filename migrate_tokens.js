import fs from 'fs/promises';
import path from 'path';

const SRC_DIR = './src';

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

const orderedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

async function walk(dir, fn) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            await walk(fullPath, fn);
        } else if (file.endsWith('.jsx')) {
            await fn(fullPath);
        }
    }
}

async function migrate() {
    let changedFiles = 0;
    await walk(SRC_DIR, async (file) => {
        let content = await fs.readFile(file, 'utf8');
        let newContent = content;

        for (const key of orderedKeys) {
            const escapedKey = key.replace(/\./g, '\\.');
            const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
            newContent = newContent.replace(regex, replacements[key]);
        }

        if (content !== newContent) {
            await fs.writeFile(file, newContent, 'utf8');
            console.log(`Updated ${file}`);
            changedFiles++;
        }
    });
    console.log(`\nCompleted. Updated ${changedFiles} files.`);
}

migrate().catch(console.error);
