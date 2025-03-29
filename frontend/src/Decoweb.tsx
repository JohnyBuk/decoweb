import { useEffect, useState, useContext } from "react";
import { Button, Collapse, Container, Slider, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ScubaDivingIcon from "@mui/icons-material/ScubaDiving";
import Grid from "@mui/material/Grid2";
import { TransitionGroup } from "react-transition-group";
import DiveChart from "./DiveChart";
import Strategy from "./Strategy";
import { DivePlanActionType } from "./reducer";
import { getKeyToLabel, separateStrategies } from "./utils";
import { DivePlanContext } from "./context";

export default function Decoweb() {
  const { divePlan, dispatch } = useContext(DivePlanContext);
  const strategies = separateStrategies(divePlan);
  const [diveProfile, setDiveProfile] = useState([]);

  const addStartegy = () => dispatch({ type: DivePlanActionType.ADD_STRATEGY });

  const setTargetDepth = (depth: number) =>
    dispatch({ type: DivePlanActionType.SET_TAREGT_DEPTH, targetDepth: depth });

  const setBottomTime = (time: number) =>
    dispatch({ type: DivePlanActionType.SET_BOTTOM_TIME, bottomTime: time });

  const fetchDiveProfiles = () => {
    fetch("/plan-dive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "target-depth": divePlan.targetDepth,
        "bottom-time": divePlan.bottomTime,
        strategies: strategies,
      }),
    })
      .then((response) => response.json())
      .then((diveProfiles) => {
        setDiveProfile(diveProfiles);
      });
  };

  // show default dive profile graph
  useEffect(() => fetchDiveProfiles(), []);

  return (
    <Container fixed sx={{ marginBottom: 10 }}>
      <DiveChart
        diveProfiles={diveProfile}
        keyToLabel={getKeyToLabel(strategies)}
      />
      <Grid container columnSpacing={5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography>Target depth {divePlan.targetDepth} meters</Typography>
          <Slider
            value={divePlan.targetDepth}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(_event, newValue, _activeThumb) => {
              setTargetDepth(Array.isArray(newValue) ? newValue[0] : newValue);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography>Bottom time {divePlan.bottomTime} minutes</Typography>
          <Slider
            value={divePlan.bottomTime}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(_event, newValue, _activeThumb) => {
              setBottomTime(Array.isArray(newValue) ? newValue[0] : newValue);
            }}
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 2 }}
          sx={{ display: "flex", justifyContent: "end" }}
        >
          <Button
            variant="contained"
            startIcon={<ScubaDivingIcon />}
            disableElevation
            onClick={fetchDiveProfiles}
          >
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
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        disableElevation
        onClick={addStartegy}
      >
        Add strategy
      </Button>
    </Container>
  );
}
