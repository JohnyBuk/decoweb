export type GasType = {
  strategyUuid: string;
  gassUuid: string;
  oxygen: number;
  helium: number;
};

export type StrategyType = {
  uuid: string;
  gasses: GasType[];
};

export type DivePlanType = {
  targetDepth: number;
  bottomTime: number;
  gasses: GasType[];
};
