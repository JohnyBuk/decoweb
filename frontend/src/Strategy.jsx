import { Box, Button, Typography } from "@mui/material";
import Gass from "./Gass.jsx";
import { useContext } from "react";
import { DivePlanDispatchContext } from "./context.jsx";
import { Actions } from "./reducer.jsx";

export default function Strategy({ id, strategy, removable }) {
  const dispatch = useContext(DivePlanDispatchContext);

  const deleteStrategy = () => {
    dispatch({ type: Actions.REMOVE_STRATEGY, strategyUuid: strategy.uuid });
  };

  const addGass = () => {
    dispatch({ type: Actions.ADD_GASS, strategyUuid: strategy.uuid });
  };

  return (
    <Box
      backgroundColor={"blue"}
      borderRadius={1}
      p={1}
      marginBottom={3}
      marginTop={id === 0 ? 3 : 0}
    >
      <Typography variant="h5">Strategy {id + 1}</Typography>
      {strategy.gasses.map((gass, i) => (
        <Gass
          key={i}
          id={i}
          gass={gass}
          removable={strategy.gasses.length > 1}
        />
      ))}
      <Box display={"flex"} justifyContent={"space-between"}>
        <Button
          variant="outlined"
          disabled={!removable}
          onClick={() => deleteStrategy(strategy.uuid)}
        >
          Delete strategy
        </Button>
        <Button variant="outlined" onClick={() => addGass(strategy.uuid)}>
          Add gass
        </Button>
      </Box>
    </Box>
  );
}
