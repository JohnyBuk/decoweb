import { useEffect, useState, useContext } from "react";
import { Button, Collapse, Container, Slider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { TransitionGroup } from "react-transition-group";
import DiveChart from "./Chart.jsx";
import Strategy from "./Strategy.jsx";
import { Actions, separateStrategies } from "./reducer.jsx";
import { DivePlanContext, DivePlanDispatchContext } from "./context.jsx";

export default function Decoweb() {
  const divePlan = useContext(DivePlanContext);
  const dispatch = useContext(DivePlanDispatchContext);
  const strategies = separateStrategies(divePlan);
  const [diveProfile, setDiveProfile] = useState([]);

  const addStartegy = () => dispatch({ type: Actions.ADD_STRATEGY });

  const setTargetDepth = (depth) =>
    dispatch({ type: Actions.SET_TAREGT_DEPTH, targetDepth: depth });

  const setBottomTime = (time) =>
    dispatch({ type: Actions.SET_BOTTOM_TIME, bottomTime: time });

  const planDive = () => {
    const newDivePlan = {
      "target-depth": divePlan.targetDepth,
      "bottom-time": divePlan.bottomTime,
      strategies: strategies,
    };
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
        setDiveProfile(data);
      });
  };

  // show default dive profile graph
  useEffect(() => planDive(), []);

  const getKeyToLabel = () => {
    let keyToLabel = {};
    strategies.forEach((strategy, i) => {
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
        {strategies.map((strategy, i) => (
          <Collapse key={i}>
            <Strategy
              id={i}
              strategy={strategy}
              removable={strategies.length > 1}
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
