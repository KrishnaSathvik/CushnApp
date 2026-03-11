import { AUDIT_SERVICE_CATALOG } from "../db/auditServiceCatalog";

let auditItemCounter = 0;

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

function getMonthlyPrice(service) {
  if (typeof service.monthlyPrice === "number") return service.monthlyPrice;
  if (typeof service.annualPrice === "number") return service.annualPrice / 12;
  return 0;
}

export function findAuditService(query) {
  const normalizedQuery = normalizeName(query);
  if (!normalizedQuery) return null;

  return (
    AUDIT_SERVICE_CATALOG.find((service) =>
      [service.name, ...(service.aliases || [])]
        .map(normalizeName)
        .some(
          (candidate) =>
            candidate === normalizedQuery ||
            candidate.includes(normalizedQuery) ||
            normalizedQuery.includes(candidate),
        ),
    ) || null
  );
}

export function createAuditItem({ service, name, monthlyAmount }) {
  const resolvedName = service?.name || String(name || "").trim();
  const resolvedMonthlyAmount =
    typeof monthlyAmount === "number" ? monthlyAmount : getMonthlyPrice(service);

  if (!resolvedName || !Number.isFinite(resolvedMonthlyAmount) || resolvedMonthlyAmount <= 0) {
    return null;
  }

  return {
    id: `${resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${auditItemCounter++}`,
    name: resolvedName,
    category: service?.category || "Custom",
    monthlyAmount: roundCurrency(resolvedMonthlyAmount),
    isKnownService: Boolean(service),
  };
}

export function calculateAuditTotals(items) {
  const monthly = roundCurrency(
    items.reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0),
  );
  const annual = roundCurrency(monthly * 12);
  const daily = roundCurrency(annual / 365);

  return {
    monthly,
    annual,
    daily,
    itemCount: items.length,
  };
}

export function getAuditSuggestions(items) {
  return [...items]
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
    .slice(0, 3);
}

export function getQuickAuditServices(limit = 8) {
  return AUDIT_SERVICE_CATALOG.slice(0, limit);
}
