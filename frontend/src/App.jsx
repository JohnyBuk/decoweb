import { DivePlanContext, DivePlanDispatchContext } from "./context";
import { divePlanReducer, initialDivePlan } from "./reducer";
import { useReducer } from "react";
import Decoweb from "./Decoweb";

export default function App() {
  const [divePlan, dispatch] = useReducer(divePlanReducer, initialDivePlan);

  return (
    <DivePlanContext.Provider value={divePlan}>
      <DivePlanDispatchContext.Provider value={dispatch}>
        <Decoweb />
      </DivePlanDispatchContext.Provider>
    </DivePlanContext.Provider>
  );
}
