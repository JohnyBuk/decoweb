import { DivePlanType } from "./types";
import { v4 as uuidv4 } from "uuid";

export const enum DivePlanActionType {
  ADD_GASS,
  REMOVE_GASS,
  ADD_STRATEGY,
  REMOVE_STRATEGY,
  SET_TAREGT_DEPTH,
  SET_BOTTOM_TIME,
  SET_OXYGEN_LEVEL,
  SET_HELIUM_LEVEL,
}

type DivePlanAction = {
  type: DivePlanActionType;
  strategyUuid: string;
  gassUuid: string;
  bottomTime: number;
  targetDepth: number;
  oxygen: number;
  helium: number;
};

export function divePlanReducer(
  prevDivePlan: DivePlanType,
  action: DivePlanAction
): DivePlanType {
  switch (action.type) {
    case DivePlanActionType.ADD_GASS:
      return {
        ...prevDivePlan,
        gasses: [
          ...prevDivePlan.gasses,
          {
            strategyUuid: action.strategyUuid,
            gassUuid: uuidv4(),
            oxygen: 21,
            helium: 0,
          },
        ],
      };

    case DivePlanActionType.ADD_STRATEGY:
      return {
        ...prevDivePlan,
        gasses: [
          ...prevDivePlan.gasses,
          {
            strategyUuid: uuidv4(),
            gassUuid: uuidv4(),
            oxygen: 21,
            helium: 0,
          },
        ],
      };

    case DivePlanActionType.REMOVE_STRATEGY:
      return {
        ...prevDivePlan,
        gasses: prevDivePlan.gasses.filter(
          (gass) => gass.strategyUuid != action.strategyUuid
        ),
      };

    case DivePlanActionType.REMOVE_GASS:
      return {
        ...prevDivePlan,
        gasses: prevDivePlan.gasses.filter(
          (gass) => gass.gassUuid != action.gassUuid
        ),
      };

    case DivePlanActionType.SET_BOTTOM_TIME:
      return { ...prevDivePlan, bottomTime: action.bottomTime };

    case DivePlanActionType.SET_TAREGT_DEPTH:
      return { ...prevDivePlan, targetDepth: action.targetDepth };

    case DivePlanActionType.SET_OXYGEN_LEVEL:
      return {
        ...prevDivePlan,
        gasses: prevDivePlan.gasses.map((gass) => {
          if (gass.gassUuid === action.gassUuid)
            return { ...gass, oxygen: action.oxygen };
          return gass;
        }),
      };

    case DivePlanActionType.SET_HELIUM_LEVEL:
      return {
        ...prevDivePlan,
        gasses: prevDivePlan.gasses.map((gass) => {
          if (gass.gassUuid === action.gassUuid)
            return { ...gass, helium: action.helium };
          return gass;
        }),
      };

    default:
      return prevDivePlan;
  }
}
