import { Box, Button, Typography } from "@mui/material";
import Gass from "./Gass.jsx";

export default function Strategy({
  id,
  strategy,
  setOxygenLevel,
  setHeliumLevel,
  addGass,
  deleteGass,
  deleteStrategy,
}) {
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
          setOxygenLevel={setOxygenLevel}
          setHeliumLevel={setHeliumLevel}
          deleteGass={strategy.gasses.length > 1 ? deleteGass : null}
        />
      ))}
      <Box display={"flex"} justifyContent={"space-between"}>
        <Button
          variant="outlined"
          disabled={deleteStrategy === null}
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
