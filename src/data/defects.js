export const SEED_BUGS = [
  {
    id: 1,
    title: "Button runs away when hovered",
    description:
      "The submit button gains sentience and dodges the cursor. Reproducible on Mondays.",
    severity: "Critical",
  },
  {
    id: 2,
    title: "Database returns emojis instead of IDs",
    description:
      'SELECT id FROM users returns 🤡, 💀, 🔥. DBA says "it is a feature".',
    severity: "Major",
  },
  {
    id: 3,
    title: "404 page actually found something",
    description:
      "The 404 page started returning a recipe for banana bread. Users are delighted.",
    severity: "Minor",
  },
];

const STORAGE_KEY = "defects";

export function getDefects() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BUGS));
    return [...SEED_BUGS];
  }
  return JSON.parse(raw);
}

export function saveDefects(defects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defects));
}

export function createDefect(defect) {
  const defects = getDefects();
  const maxId = defects.reduce((max, d) => Math.max(max, d.id), 0);
  const newDefect = { ...defect, id: maxId + 1 };
  defects.push(newDefect);
  saveDefects(defects);
  return newDefect;
}

export function resolveDefect(id) {
  const defects = getDefects().filter((d) => d.id !== id);
  saveDefects(defects);
  return defects;
}

export function resetDefects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BUGS));
  return [...SEED_BUGS];
}
