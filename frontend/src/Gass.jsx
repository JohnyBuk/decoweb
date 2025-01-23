import { Box, Button, Slider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

export default function Gass({ id, gass, setOxygenLevel, setHeliumLevel, deleteGass }) {
    return (
      <Box backgroundColor={"black"} p={2} marginBottom={2} borderRadius={1}>
        <Grid container columnSpacing={5}>
          <Grid
            size={{ xs: 12 }}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Typography variant="h6">Gass {id + 1}</Typography>
            <Button
              variant="contained"
              disabled={deleteGass === null}
              onClick={() => deleteGass(gass.uuid)}
            >
              Delete gass
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>Oxygen {gass.oxygen} %</Typography>
            <Slider
              value={gass.oxygen}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChange={(event, newValue) => {
                setOxygenLevel(gass.uuid, newValue);
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
                setHeliumLevel(gass.uuid, newValue);
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }