import { Box, Button, Slider, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid2";
import { useContext } from "react";
import { DivePlanDispatchContext } from "./context";
import { Actions } from "./reducer";

export default function Gass({ id, gass, removable }) {
  const dispatch = useContext(DivePlanDispatchContext);

  const removeGass = () =>
    dispatch({ type: Actions.REMOVE_GASS, gassUuid: gass.uuid });

  const setOxygenLevel = (value) =>
    dispatch({
      type: Actions.SET_OXYGEN_LEVEL,
      gassUuid: gass.uuid,
      oxygen: value,
    });

  const setHeliumLevel = (value) =>
    dispatch({
      type: Actions.SET_HELIUM_LEVEL,
      gassUuid: gass.uuid,
      helium: value,
    });

  return (
    <Box backgroundColor={"white"} p={2} marginBottom={2} borderRadius={1}>
      <Grid container columnSpacing={5}>
        <Grid
          size={{ xs: 12 }}
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Typography variant="h6" color="#1976d2">
            Gass {id + 1}
          </Typography>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            disableElevation
            disabled={!removable}
            onClick={() => removeGass(gass.uuid)}
          >
            Remove gass
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography>Oxygen {gass.oxygen} %</Typography>
          <Slider
            value={gass.oxygen}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(event, newValue) => {
              setOxygenLevel(newValue);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography>Helium {gass.helium} %</Typography>
          <Slider
            value={gass.helium}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(event, newValue) => {
              setHeliumLevel(newValue);
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
