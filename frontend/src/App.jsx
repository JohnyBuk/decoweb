import { useEffect, useState } from "react";
import { Button, Collapse, Container, Slider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { TransitionGroup } from "react-transition-group";
import { v4 as uuidv4 } from "uuid";
import DiveChart from "./Chart.jsx";
import Strategy from "./Strategy.jsx";

export default function App() {
  const [divePlan, setDivePlan] = useState({
    targetDepth: 35,
    bottomTime: 20,
    strategies: [
      {
        uuid: uuidv4(),
        gasses: [
          {
            uuid: uuidv4(),
            oxygen: 21,
            helium: 0,
          },
          {
            uuid: uuidv4(),
            oxygen: 50,
            helium: 20,
          },
        ],
      },
      {
        uuid: uuidv4(),
        gasses: [
          {
            uuid: uuidv4(),
            oxygen: 30,
            helium: 10,
          },
        ],
      },
    ],
  });

  const [diveProfile, setDiveProfile] = useState([]);

  const setTargetDepth = (depth) => {
    setDivePlan((prevDivePlan) => {
      const newDivePlan = { ...prevDivePlan };
      newDivePlan.targetDepth = depth;
      return newDivePlan;
    });
  };

  const setBottomTime = (time) => {
    setDivePlan((prevDivePlan) => {
      const newDivePlan = { ...prevDivePlan };
      newDivePlan.bottomTime = time;
      return newDivePlan;
    });
  };

  const findGassLocation = (strategies, uuid) => {
    for (let strategy_id = 0; strategy_id < strategies.length; strategy_id++) {
      const gass_id = strategies[strategy_id].gasses.findIndex((gass) => {
        return gass.uuid === uuid;
      });
      if (gass_id >= 0) return [strategy_id, gass_id];
    }
    return null;
  };

  const setOxygenLevel = (gass_uuid, oxygen) => {
    setDivePlan((prevDivePlan) => {
      const [strategy_id, gass_id] = findGassLocation(
        prevDivePlan.strategies,
        gass_uuid
      );
      const newDivePlan = { ...prevDivePlan };
      newDivePlan.strategies[strategy_id].gasses[gass_id].oxygen = oxygen;
      return newDivePlan;
    });
  };

  const setHeliumLevel = (gass_uuid, helium) => {
    setDivePlan((prevDivePlan) => {
      const [strategy_id, gass_id] = findGassLocation(
        prevDivePlan.strategies,
        gass_uuid
      );
      const newDivePlan = { ...prevDivePlan };
      newDivePlan.strategies[strategy_id].gasses[gass_id].helium = helium;
      return newDivePlan;
    });
  };

  const addGass = (strategy_uuid) =>
    setDivePlan((prevDivePlan) => {
      for (let i = 0; i < prevDivePlan.strategies.length; i++) {
        if (prevDivePlan.strategies[i].uuid === strategy_uuid) {
          const newDivePlan = { ...prevDivePlan };
          newDivePlan.strategies[i].gasses.push({
            oxygen: 21,
            helium: 0,
            uuid: uuidv4(),
          });
          return newDivePlan;
        }
      }
      return prevDivePlan;
    });

  const deleteGass = (gass_uuid) => {
    setDivePlan((prevDivePlan) => {
      const [strategy_id, gass_id] = findGassLocation(
        prevDivePlan.strategies,
        gass_uuid
      );
      const oldGasses = prevDivePlan.strategies[strategy_id].gasses;
      if (oldGasses.length <= 1) return prevDivePlan;

      const newDivePlan = { ...prevDivePlan };
      newDivePlan.strategies[strategy_id].gasses.splice(gass_id, 1);
      return newDivePlan;
    });
  };

  const addStartegy = () =>
    setDivePlan((prevDivePlan) => {
      const newDivePlan = { ...prevDivePlan };
      newDivePlan.strategies.push({
        uuid: uuidv4(),
        gasses: [{ oxygen: 21, helium: 0, uuid: uuidv4() }],
      });

      return newDivePlan;
    });

  const deleteStrategy = (strategy_uuid) => {
    setDivePlan((prevDivePlan) => {
      if (prevDivePlan.strategies.length <= 1) return prevDivePlan;
      const newDivePlan = { ...prevDivePlan };
      newDivePlan.strategies = prevDivePlan.strategies.filter((strategy) => {
        return strategy.uuid !== strategy_uuid;
      });
      return newDivePlan;
    });
  };

  const planDive = () => {
    console.log(divePlan);
    const newDivePlan = {
      "target-depth": divePlan.targetDepth,
      "bottom-time": divePlan.bottomTime,
      strategies: divePlan.strategies,
    };
    console.log(newDivePlan);
    fetchDiveProfiles(newDivePlan);
  };

  const fetchDiveProfiles = (dict) => {
    fetch("http://127.0.0.1:5000/plan-dive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dict),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setDiveProfile(data);
      });
  };

  // show default dive profile graph
  useEffect(() => planDive(), []);

  const getKeyToLabel = () => {
    let keyToLabel = {};
    divePlan.strategies.forEach((strategy, i) => {
      keyToLabel[strategy.uuid] =
        "Strategy " + (i + 1).toString() + " depth (m)";
    });
    return keyToLabel;
  };

  return (
    <Container fixed>
      <DiveChart diveProfiles={diveProfile} keyToLabel={getKeyToLabel()} />
      <Grid container columnSpacing={5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography>Target depth {divePlan.targetDepth} meters</Typography>
          <Slider
            value={divePlan.targetDepth}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(event, newValue) => {
              setTargetDepth(newValue);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography>Bottom time {divePlan.bottomTime} minutes</Typography>
          <Slider
            value={divePlan.bottomTime}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(event, newValue) => {
              setBottomTime(newValue);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <br></br>
          <Button variant="contained" onClick={planDive}>
            Plan dive
          </Button>
        </Grid>
      </Grid>
      <TransitionGroup>
        {divePlan.strategies.map((strategy, i) => (
          <Collapse key={i}>
            <Strategy
              id={i}
              strategy={strategy}
              setOxygenLevel={setOxygenLevel}
              setHeliumLevel={setHeliumLevel}
              addGass={addGass}
              deleteGass={deleteGass}
              deleteStrategy={
                divePlan.strategies.length > 1 ? deleteStrategy : null
              }
            />
          </Collapse>
        ))}
      </TransitionGroup>
      <Button variant="contained" onClick={addStartegy}>
        Add strategy
      </Button>
    </Container>
  );
}
