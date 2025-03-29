import { Box, Button, Slider, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid2";
import { useContext } from "react";
import { DivePlanContext } from "./context";
import { DivePlanActionType } from "./reducer";
import { GassType } from "./types";

type GassProps = {
  id: number;
  gass: GassType;
  removable: boolean;
};

export default function Gass({ id, gass, removable }: GassProps) {
  const { dispatch } = useContext(DivePlanContext);

  const removeGass = () =>
    dispatch({ type: DivePlanActionType.REMOVE_GASS, gassUuid: gass.gassUuid });

  const setOxygenLevel = (value: number) =>
    dispatch({
      type: DivePlanActionType.SET_OXYGEN_LEVEL,
      gassUuid: gass.gassUuid,
      oxygen: value,
    });

  const setHeliumLevel = (value: number) =>
    dispatch({
      type: DivePlanActionType.SET_HELIUM_LEVEL,
      gassUuid: gass.gassUuid,
      helium: value,
    });

  return (
    <Box
      sx={{ backgroundColor: "white", p: 2, marginBottom: 2, borderRadius: 2 }}
    >
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
            onClick={removeGass}
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
            onChange={(_event, newValue, _activeThumb) => {
              setOxygenLevel(Array.isArray(newValue) ? newValue[0] : newValue);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography>Helium {gass.helium} %</Typography>
          <Slider
            value={gass.helium}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(_event, newValue, _activeThumb) => {
              setHeliumLevel(Array.isArray(newValue) ? newValue[0] : newValue);
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
