import { DivePlanType, StrategyType } from "./types";

export function separateStrategies(divePlan: DivePlanType): StrategyType[] {
  const strategiesUuids = new Set<string>();
  for (const gass of divePlan.gasses) {
    strategiesUuids.add(gass.strategyUuid);
  }

  const strategies = new Array<StrategyType>();
  for (const strategyUuid of strategiesUuids) {
    strategies.push({
      uuid: strategyUuid,
      gasses: [],
    });
  }

  for (const gass of divePlan.gasses) {
    const strategy = strategies.find(
      (s: StrategyType) => s.uuid === gass.strategyUuid
    );
    strategy!.gasses.push({
      oxygen: gass.oxygen,
      helium: gass.helium,
      gassUuid: gass.gassUuid,
      strategyUuid: gass.strategyUuid,
    });
  }
  return strategies;
}

export function getKeyToLabel(strategies: StrategyType[]): Map<string, string> {
  let keyToLabel = new Map<string, string>();
  strategies.forEach((strategy, i) => {
    keyToLabel.set(
      strategy.uuid,
      "Strategy " + (i + 1).toString() + " depth (m)"
    );
  });
  return keyToLabel;
}
