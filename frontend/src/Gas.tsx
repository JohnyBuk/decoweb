import { Box, Button, Slider, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid2";
import { useContext, useState } from "react";
import { DivePlanContext } from "./context";
import { DivePlanActionType } from "./reducer";
import { GasType } from "./types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type GasProps = {
  id: number;
  gas: GasType;
  removable: boolean;
};

export default function Gas({ id, gas, removable }: GasProps) {
  const [oxygen, setOxygenLevel] = useState(gas.oxygen);
  const [helium, setHeliumLevel] = useState(gas.helium);
  const queryClient = useQueryClient();

  const updateGasMutation = useMutation({
    mutationFn: () => {
      return axios.put(`decoweb/api/gasses/${gas.id}`, {
        strategy: gas.strategy,
        oxygen: oxygen,
        helium: helium,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["strategies"]);
    },
  });

  const removeGasMutation = useMutation({
    mutationFn: () => {
      return axios.delete(`decoweb/api/gasses/${gas.id}`);
    },
    onSuccess: (data) => queryClient.invalidateQueries(["strategies"]),
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
            Gas {id + 1}
          </Typography>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            disableElevation
            disabled={!removable}
            onClick={() => removeGasMutation.mutate()}
          >
            Remove gas
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography>Oxygen {oxygen} %</Typography>
          <Slider
            value={oxygen}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(_event, value, _) => {
              setOxygenLevel(value as number);
            }}
            onChangeCommitted={(_event, _) => {
              updateGasMutation.mutate();
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography>Helium {helium} %</Typography>
          <Slider
            value={helium}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={(_event, value, _) => {
              setHeliumLevel(value as number);
            }}
            onChangeCommitted={(_event, _) => {
              updateGasMutation.mutate();
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
