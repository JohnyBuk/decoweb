import { Box, Button, Slider, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid2";
import { useContext, useState } from "react";
import { DivePlanContext } from "./context";
import { DivePlanActionType } from "./reducer";
import { GassType } from "./types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type GassProps = {
  id: number;
  gass: GassType;
  removable: boolean;
};

export default function Gass({ id, gass, removable }: GassProps) {
  const [oxygen, setOxygenLevel] = useState(gass.oxygen);
  const [helium, setHeliumLevel] = useState(gass.helium);
  const queryClient = useQueryClient();

  const updateGassMutation = useMutation({
    mutationFn: () => {
      return axios.put(`decoweb/api/gasses/${gass.id}`, {
        strategy: gass.strategy,
        oxygen: oxygen,
        helium: helium,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["strategies"]);
    },
  });

  const removeGassMutation = useMutation({
    mutationFn: () => {
      return axios.delete(`decoweb/api/gasses/${gass.id}`);
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
            Gass {id + 1}
          </Typography>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            disableElevation
            disabled={!removable}
            onClick={() => removeGassMutation.mutate()}
          >
            Remove gass
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
              updateGassMutation.mutate();
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
              updateGassMutation.mutate();
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
