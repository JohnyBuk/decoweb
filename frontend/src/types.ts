export type GassType = {
  strategyUuid: string;
  gassUuid: string;
  oxygen: number;
  helium: number;
};

export type StrategyType = {
  uuid: string;
  gasses: GassType[];
};

export type DivePlanType = {
  targetDepth: number;
  bottomTime: number;
  gasses: GassType[];
};
