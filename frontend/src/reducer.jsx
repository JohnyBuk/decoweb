import { v4 as uuidv4 } from "uuid";

export const Actions = {
  ADD_GASS: "ADD_GASS",
  REMOVE_GASS: "REMOVE_GASS",
  ADD_STRATEGY: "ADD_STRATEGY",
  REMOVE_STRATEGY: "REMOVE_STRATEGY",
  SET_TAREGT_DEPTH: "SET_TAREGT_DEPTH",
  SET_BOTTOM_TIME: "SET_BOTTOM_TIME",
  SET_OXYGEN_LEVEL: "SET_OXYGEN_LEVEL",
  SET_HELIUM_LEVEL: "SET_HELIUM_LEVEL",
};

export const initialDivePlan = {
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

export function divePlanReducer(prevDivePlan, action) {
  switch (action.type) {
    case Actions.ADD_GASS:
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

    case Actions.ADD_STRATEGY:
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

    case Actions.REMOVE_STRATEGY:
      return {
        ...prevDivePlan,
        gasses: prevDivePlan.gasses.filter(
          (gass) => gass.strategyUuid != action.strategyUuid
        ),
      };

    case Actions.REMOVE_GASS:
      return {
        ...prevDivePlan,
        gasses: prevDivePlan.gasses.filter(
          (gass) => gass.gassUuid != action.gassUuid
        ),
      };

    case Actions.SET_BOTTOM_TIME:
      return { ...prevDivePlan, bottomTime: action.bottomTime };

    case Actions.SET_TAREGT_DEPTH:
      return { ...prevDivePlan, targetDepth: action.targetDepth };

    case Actions.SET_OXYGEN_LEVEL:
      return {
        ...prevDivePlan,
        gasses: prevDivePlan.gasses.map((gass) => {
          if (gass.gassUuid === action.gassUuid)
            return { ...gass, oxygen: action.oxygen };
          return gass;
        }),
      };

    case Actions.SET_HELIUM_LEVEL:
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

export function separateStrategies(divePlan) {
  const strategiesUuids = new Set();
  for (const gass of divePlan.gasses) {
    strategiesUuids.add(gass.strategyUuid);
  }

  const strategies = new Array();
  for (const strategyUuid of strategiesUuids) {
    strategies.push({
      uuid: strategyUuid,
      gasses: [],
    });
  }

  for (const gass of divePlan.gasses) {
    const strategy = strategies.find((s) => s.uuid === gass.strategyUuid);
    strategy.gasses.push({
      oxygen: gass.oxygen,
      helium: gass.helium,
      uuid: gass.gassUuid,
    });
  }
  return strategies;
}
