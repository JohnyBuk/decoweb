export type GasType = {
  id: string;
  strategy: number;
  oxygen: number;
  helium: number;
};

export type StrategyType = {
  id: number;
  target_depth: number;
  bottom_time: number;
};

export type DivePlanType = {
  targetDepth: number;
  bottomTime: number;
  gasses: GasType[];
};
