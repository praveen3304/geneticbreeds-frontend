// ─────────────────────────────────────────────────────────────
// 🚀 PREMIUM FRONTEND BANNED BREED SYSTEM
// ✔ Fast
// ✔ Smart typo detection
// ✔ UX-friendly
// ✔ Matches backend logic (lightweight)
// ─────────────────────────────────────────────────────────────

// ── Normalize
function normalize(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

// ── Lightweight Levenshtein (optimized for frontend)
function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}

// ── Smart fuzzy matcher
function isFuzzyMatch(input, target) {
  const a = normalize(input);
  const b = normalize(target);

  // direct match
  if (a.includes(b) || b.includes(a)) return true;

  // typo tolerance
  return levenshtein(a, b) <= 2;
}

// ─────────────────────────────────────────
// 🧠 CORE DATA (optimized subset)
// ─────────────────────────────────────────

const BANNED_DOGS = [
  "pitbull",
  "pit bull",
  "american pit bull terrier",
  "rottweiler",
  "tosa",
  "dogo argentino",
  "fila brasileiro",
  "presa canario",
  "cane corso",
  "boerboel",
  "wolf dog",
  "wolf hybrid",
  "xl bully"
];

const ILLEGAL_WILDLIFE = [
  "tiger","lion","leopard","cheetah",
  "monkey","chimpanzee","gorilla",
  "cobra","snake","anaconda",
  "crocodile","alligator",
  "eagle","owl","falcon",
];

// ─────────────────────────────────────────
// 🧠 MAIN FUNCTION (PREMIUM)
// ─────────────────────────────────────────

export function checkBannedBreedFrontend(breed, country) {
  if (!breed || !breed.trim()) {
    return { banned: false };
  }

  const normalized = normalize(breed);

  // 🐅 Wildlife check (priority)
  for (const animal of ILLEGAL_WILDLIFE) {
    if (isFuzzyMatch(normalized, animal)) {
      return {
        banned: true,
        type: "wildlife",
        matchedBreed: animal,
      };
    }
  }

  // 🐕 Dog check
  for (const dog of BANNED_DOGS) {
    if (isFuzzyMatch(normalized, dog)) {
      return {
        banned: true,
        type: "dog",
        matchedBreed: dog,
      };
    }
  }

  return { banned: false };
}

// ─────────────────────────────────────────
// 🎨 UX HELPERS (PREMIUM)
// ─────────────────────────────────────────

// Capitalize nicely
export function formatText(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Generate UX message
export function getBannedBreedMessage(matchedBreed, country) {
  const breed = formatText(matchedBreed);
  const loc = formatText(country || "your region");

  return `⚠️ We couldn't publish your listing

The breed "${breed}" is restricted in ${loc} and cannot be listed for sale due to local regulations.

👉 Please choose a permitted breed to continue.`;
}
