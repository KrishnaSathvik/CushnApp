import { describe, expect, it } from "vitest";

import {
  calculateAuditTotals,
  createAuditItem,
  findAuditService,
  getAuditSuggestions,
} from "../lib/auditCalculator";

describe("auditCalculator", () => {
  it("finds known services from fuzzy input", () => {
    expect(findAuditService("spotify")).toMatchObject({
      name: "Spotify Premium",
    });
    expect(findAuditService("hbo max")).toMatchObject({
      name: "Max",
    });
  });

  it("creates items from known services and custom amounts", () => {
    const known = createAuditItem({ service: findAuditService("chatgpt") });
    const custom = createAuditItem({ name: "Gym app", monthlyAmount: 24.5 });

    expect(known).toMatchObject({
      name: "ChatGPT Plus",
      monthlyAmount: 20,
      isKnownService: true,
    });
    expect(custom).toMatchObject({
      name: "Gym app",
      monthlyAmount: 24.5,
      isKnownService: false,
    });
  });

  it("calculates monthly, annual, and daily totals", () => {
    const totals = calculateAuditTotals([
      { monthlyAmount: 20 },
      { monthlyAmount: 10.5 },
    ]);

    expect(totals).toMatchObject({
      monthly: 30.5,
      annual: 366,
      daily: 1,
      itemCount: 2,
    });
  });

  it("returns the highest-cost suggestions first", () => {
    const suggestions = getAuditSuggestions([
      { name: "A", monthlyAmount: 8 },
      { name: "B", monthlyAmount: 28 },
      { name: "C", monthlyAmount: 12 },
      { name: "D", monthlyAmount: 31 },
    ]);

    expect(suggestions.map((item) => item.name)).toEqual(["D", "B", "C"]);
  });
});
