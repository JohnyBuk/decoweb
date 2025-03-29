import { createContext, useReducer, ReactElement } from "react";
import { DivePlanType } from "./types";
import { divePlanReducer } from "./reducer";
import { v4 as uuidv4 } from "uuid";

export const initialDivePlan: DivePlanType = {
  targetDepth: 35,
  bottomTime: 20,
  gasses: [
    {
      strategyUuid: "strategy_1",
      gassUuid: uuidv4(),
      oxygen: 21,
      helium: 0,
    },
    {
      strategyUuid: "strategy_1",
      gassUuid: uuidv4(),
      oxygen: 50,
      helium: 20,
    },
    {
      strategyUuid: "strategy_2",
      gassUuid: uuidv4(),
      oxygen: 30,
      helium: 10,
    },
  ],
};

export const DivePlanContext = createContext<{
  divePlan: DivePlanType;
  dispatch: React.Dispatch<any>;
}>({
  divePlan: initialDivePlan,
  dispatch: () => null,
});

type DivePlanContextProviderProps = {
  child: ReactElement;
};

export function DivePlanContextProvider({
  child,
}: DivePlanContextProviderProps): ReactElement {
  const [divePlan, dispatch] = useReducer(divePlanReducer, initialDivePlan);
  return (
    <DivePlanContext.Provider value={{ divePlan, dispatch }}>
      {child}
    </DivePlanContext.Provider>
  );
}
