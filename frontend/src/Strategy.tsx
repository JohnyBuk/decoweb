import { Box, Button, Collapse, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Gass from "./Gass.js";
import { useContext } from "react";
import { DivePlanContext } from "./context";
import { DivePlanActionType } from "./reducer";
import { TransitionGroup } from "react-transition-group";
import { StrategyType } from "./types.js";

type StrategyProps = {
  id: number;
  strategy: StrategyType;
  removable: boolean;
};

export default function Strategy({ id, strategy, removable }: StrategyProps) {
  const { dispatch } = useContext(DivePlanContext);

  const removeStrategy = () => {
    dispatch({
      type: DivePlanActionType.REMOVE_STRATEGY,
      strategyUuid: strategy.uuid,
    });
  };

  const addGass = () => {
    dispatch({
      type: DivePlanActionType.ADD_GASS,
      strategyUuid: strategy.uuid,
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#1976d2",
        borderRadius: 1,
        p: 1,
        marginBottom: 3,
        marginTop: id === 0 ? 3 : 0,
      }}
    >
      <Typography variant="h5" color="white" mb={1}>
        Strategy {id + 1}
      </Typography>
      <TransitionGroup>
        {strategy.gasses.map((gass, i) => (
          <Collapse key={i}>
            <Gass
              key={i}
              id={i}
              gass={gass}
              removable={strategy.gasses.length > 1}
            />{" "}
          </Collapse>
        ))}
      </TransitionGroup>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Button
          variant="outlined"
          disableElevation
          startIcon={<DeleteIcon />}
          disabled={!removable}
          onClick={removeStrategy}
          sx={{
            backgroundColor: removable ? "white" : "#e0e0e0",
            color: removable ? "#1976d2" : "#a6a6a6",
          }}
        >
          Remove strategy
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disableElevation
          onClick={addGass}
          sx={{
            backgroundColor: "white",
            color: "#1976d2",
          }}
        >
          Add gass
        </Button>
      </Box>
    </Box>
  );
}
