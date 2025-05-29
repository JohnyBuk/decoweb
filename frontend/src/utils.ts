import { DivePlanType, StrategyType } from "./types";

export function getKeyToLabel(strategies: StrategyType[]): Map<string, string> {
  let keyToLabel = new Map<string, string>();
  strategies.data.forEach((strategy, i) => {
    keyToLabel.set(
      strategy.id,
      "Strategy " + (i + 1).toString() + " depth (m)"
    );
  });
  return keyToLabel;
}
