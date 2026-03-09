// ─── Service → Domain Map ─────────────────────────────────────────────────────
// Used by ServiceLogo to fetch favicons via Google's favicon API.
// Extracted from tokens.js to keep that file focused on design tokens.

export const SERVICE_DOMAINS = {
    // Entertainment & Streaming
    'Netflix': 'netflix.com',
    'Spotify': 'spotify.com',
    'YouTube': 'youtube.com',
    'YouTube Premium': 'youtube.com',
    'Hulu': 'hulu.com',
    'Disney+': 'disneyplus.com',
    'Apple TV+': 'tv.apple.com',
    'HBO Max': 'max.com',
    'Max': 'max.com',
    'Peacock': 'peacocktv.com',
    'Paramount+': 'paramountplus.com',
    'Crunchyroll': 'crunchyroll.com',
    'Prime Video': 'primevideo.com',
    'Amazon Prime': 'amazon.com',
    'Twitch': 'twitch.tv',
    'Apple Music': 'music.apple.com',
    'Pandora': 'pandora.com',
    'Tidal': 'tidal.com',
    'SiriusXM': 'siriusxm.com',
    'SoundCloud': 'soundcloud.com',
    'Amazon Music': 'music.amazon.com',
    'AMC+': 'amcplus.com',
    'Discovery+': 'discoveryplus.com',
    'Starz': 'starz.com',
    'Showtime': 'showtime.com',
    'Shudder': 'shudder.com',

    // Gaming
    'Xbox': 'xbox.com',
    'Xbox Game Pass': 'xbox.com',
    'PlayStation': 'playstation.com',
    'PlayStation Plus': 'playstation.com',
    'Nintendo Switch Online': 'nintendo.com',
    'Nintendo': 'nintendo.com',
    'EA Play': 'ea.com',
    'Ubisoft+': 'ubisoft.com',
    'Steam': 'steampowered.com',
    'Discord': 'discord.com',
    'Discord Nitro': 'discord.com',
    'Humble Choice': 'humblebundle.com',

    // Software & Developer Tools
    'GitHub': 'github.com',
    'GitHub Copilot': 'github.com',
    'Figma': 'figma.com',
    'Vercel': 'vercel.com',
    'Netlify': 'netlify.com',
    'Linear': 'linear.app',
    'Notion': 'notion.so',
    'Jira': 'atlassian.com',
    'Postman': 'postman.com',
    'Sentry': 'sentry.io',
    'Datadog': 'datadoghq.com',
    'AWS': 'aws.amazon.com',
    'Azure': 'azure.microsoft.com',
    'DigitalOcean': 'digitalocean.com',
    'Heroku': 'heroku.com',
    'JetBrains': 'jetbrains.com',
    'Webflow': 'webflow.com',
    'Microsoft 365': 'microsoft365.com',
    'Google Workspace': 'workspace.google.com',
    'Docker': 'docker.com',
    'Supabase': 'supabase.com',

    // AI Tools
    'Claude Pro': 'claude.ai',
    'Claude': 'claude.ai',
    'ChatGPT': 'chatgpt.com',
    'ChatGPT Pro': 'chatgpt.com',
    'ChatGPT Plus': 'chatgpt.com',
    'OpenAI': 'openai.com',
    'Perplexity': 'perplexity.ai',
    'Midjourney': 'midjourney.com',
    'Jasper': 'jasper.ai',
    'Notion AI': 'notion.so',

    // Work & Productivity
    'Slack': 'slack.com',
    'Zoom': 'zoom.us',
    'Loom': 'loom.com',
    'Todoist': 'todoist.com',
    'Obsidian': 'obsidian.md',
    'Craft': 'craft.do',

    // Cloud & Storage
    'Apple One': 'apple.com',
    'iCloud': 'icloud.com',
    'iCloud+': 'icloud.com',
    'Dropbox': 'dropbox.com',
    'Google One': 'one.google.com',
    'OneDrive': 'microsoft.com',
    'Box': 'box.com',

    // Health & Fitness
    'Headspace': 'headspace.com',
    'Calm': 'calm.com',
    'MyFitnessPal': 'myfitnesspal.com',
    'Peloton': 'onepeloton.com',
    'Whoop': 'whoop.com',
    'Planet Fitness': 'planetfitness.com',
    'LA Fitness': 'lafitness.com',
    'Equinox': 'equinox.com',
    'Crunch Fitness': 'crunch.com',
    'Anytime Fitness': 'anytimefitness.com',
    '24 Hour Fitness': '24hourfitness.com',
    'Strava': 'strava.com',
    'Oura': 'ouraring.com',
    'Fitbit': 'fitbit.com',

    // News & Media
    'New York Times': 'nytimes.com',
    'NYT': 'nytimes.com',
    'Wall Street Journal': 'wsj.com',
    'WSJ': 'wsj.com',
    'Washington Post': 'washingtonpost.com',
    'Medium': 'medium.com',
    'Substack': 'substack.com',
    'The Athletic': 'theathletic.com',
    'Economist': 'economist.com',
    'Patreon': 'patreon.com',

    // Utilities & Telecom
    'AT&T': 'att.com',
    'Verizon': 'verizon.com',
    'T-Mobile': 't-mobile.com',
    'Comcast': 'xfinity.com',
    'Xfinity': 'xfinity.com',
    'Spectrum': 'spectrum.com',
    'Cox': 'cox.com',
    'PG&E': 'pge.com',
    'ConEdison': 'coned.com',
    'Google Fi': 'fi.google.com',
    'Mint Mobile': 'mintmobile.com',
    'Visible': 'visible.com',


    // Insurance & Loans
    'Geico': 'geico.com',
    'State Farm': 'statefarm.com',
    'Progressive': 'progressive.com',
    'Allstate': 'allstate.com',
    'Farmers Insurance': 'farmers.com',
    'Liberty Mutual': 'libertymutual.com',
    'Chase': 'chase.com',
    'Bank of America': 'bankofamerica.com',
    'Wells Fargo': 'wellsfargo.com',
    'Capital One': 'capitalone.com',
    'Discover': 'discover.com',
    'American Express': 'americanexpress.com',
    'Amex': 'americanexpress.com',
    'Citi': 'citi.com',
    'Upstart': 'upstart.com',
    'Lending Club': 'lendingclub.com',
    'LendingClub': 'lendingclub.com',
    'Ally': 'ally.com',
    'Ally Financial': 'ally.com',
    'SoFi': 'sofi.com',
    'Prosper': 'prosper.com',
    'Avant': 'avant.com',
    'Best Egg': 'bestegg.com',
    'Marcus': 'marcus.com',
    'OneMain Financial': 'onemainfinancial.com',
    'Affirm': 'affirm.com',
    'Klarna': 'klarna.com',
    'Afterpay': 'afterpay.com',
    'Carvana': 'carvana.com',
    'CarMax': 'carmax.com',
    'Toyota Financial': 'toyotafinancial.com',
    'Ford Credit': 'ford.com',

    // Security & Design
    '1Password': '1password.com',
    'Bitwarden': 'bitwarden.com',
    'LastPass': 'lastpass.com',
    'Dashlane': 'dashlane.com',
    'NordVPN': 'nordvpn.com',
    'ExpressVPN': 'expressvpn.com',
    'Surfshark': 'surfshark.com',
    'Adobe': 'adobe.com',
    'Adobe Creative Cloud': 'adobe.com',
    'Canva': 'canva.com',
    'Grammarly': 'grammarly.com',
    'Duolingo': 'duolingo.com',

    // Food & Delivery
    'Uber One': 'uber.com',
    'Uber': 'uber.com',
    'DoorDash': 'doordash.com',
    'DashPass': 'doordash.com',
    'Grubhub': 'grubhub.com',
    'Grubhub+': 'grubhub.com',
    'Instacart': 'instacart.com',
    'Instacart+': 'instacart.com',
    'Walmart+': 'walmart.com',
    'Costco': 'costco.com',
    'Target Circle 360': 'target.com',

    // Movie Theaters
    'AMC Stubs A-List': 'amctheatres.com',
    'AMC Theatres': 'amctheatres.com',
    'AMC': 'amctheatres.com',
    'Regal Unlimited': 'regmovies.com',
    'Regal Cinemas': 'regmovies.com',
    'Regal': 'regmovies.com',
    'Cinemark Movie Club': 'cinemark.com',
    'Cinemark': 'cinemark.com',
    'Alamo Drafthouse': 'drafthouse.com',
    'Alamo Season Pass': 'drafthouse.com',
    'Fandango': 'fandango.com',
    'Atom Tickets': 'atomtickets.com',

    // Dating Apps
    'Tinder': 'tinder.com',
    'Bumble': 'bumble.com',
    'Hinge': 'hinge.co',
    'Match': 'match.com',
    'OkCupid': 'okcupid.com',
    'Grindr': 'grindr.com',

    // Subscription Boxes & Meal Kits
    'HelloFresh': 'hellofresh.com',
    'Blue Apron': 'blueapron.com',
    'EveryPlate': 'everyplate.com',
    'Factor': 'factor75.com',
    'BarkBox': 'barkbox.com',
    'IPSY': 'ipsy.com',
    'Dollar Shave Club': 'dollarshaveclub.com',
    'Stitch Fix': 'stitchfix.com',
    'Chewy': 'chewy.com',
    'Petco': 'petco.com',
}

/**
 * Attempts to find a domain for a service name.
 * Falls back to guessing `name.com` if not in the map.
 * @param {string} name - Service name, e.g. "Netflix"
 * @returns {string|null} Domain string or null if no reasonable guess
 */
export function getServiceDomain(name) {
    const metadata = getServiceMetadata(name)
    return metadata?.domain || null
}

export function getServiceMetadata(name) {
    if (!name) return null

    // Exact match
    if (SERVICE_DOMAINS[name]) {
        return {
            canonicalName: name,
            domain: SERVICE_DOMAINS[name],
            confidence: 1,
            matchType: 'exact',
        }
    }

    // Case-insensitive match
    const lower = name.toLowerCase()

    // First pass: exact case-insensitive match
    let match = Object.entries(SERVICE_DOMAINS).find(
        ([key]) => key.toLowerCase() === lower
    )
    if (match) {
        return {
            canonicalName: match[0],
            domain: match[1],
            confidence: 0.98,
            matchType: 'case-insensitive',
        }
    }

    // Second pass: does the input name start with a known service brand? 
    // E.g. "Upstart Loan" starts with "Upstart"
    // Sort by length descending so "Xbox Game Pass" matches before "Xbox"
    const sortedKeys = Object.keys(SERVICE_DOMAINS).sort((a, b) => b.length - a.length)
    const prefixMatchKey = sortedKeys.find(key => lower.startsWith(key.toLowerCase() + ' ') || lower === key.toLowerCase())
    if (prefixMatchKey) {
        return {
            canonicalName: prefixMatchKey,
            domain: SERVICE_DOMAINS[prefixMatchKey],
            confidence: 0.94,
            matchType: 'prefix',
        }
    }

    // Third pass: does the input name CONTAIN the brand name?
    // E.g. "My Upstart Loan" contains "Upstart"
    const containsMatchKey = sortedKeys.find(key => {
        const keyLower = key.toLowerCase()
        // Ensure it matches as a whole word, not part of another word
        const regex = new RegExp(`\\b${keyLower}\\b`)
        return regex.test(lower)
    })
    if (containsMatchKey) {
        return {
            canonicalName: containsMatchKey,
            domain: SERVICE_DOMAINS[containsMatchKey],
            confidence: 0.88,
            matchType: 'contains',
        }
    }

    // Smart fallback: try name.com (strip spaces/special chars)
    // Only use the first word to be safer on things like "Upstart Loan" -> upstart.com
    const firstWord = lower.split(' ')[0]
    const slug = firstWord.replace(/[^a-z0-9]/g, '')
    if (slug.length >= 2) {
        return {
            canonicalName: name.trim(),
            domain: `${slug}.com`,
            confidence: 0.45,
            matchType: 'fallback',
        }
    }

    return null
}
