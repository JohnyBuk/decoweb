import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Slider, Typography } from "@mui/material";
import { GasType, StrategyType } from "./types";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid2";
import axios from "axios";

import { useState } from "react";

type GasProps = {
  index: number;
  gas: GasType;
  strategy: StrategyType;
  removable: boolean;
};

export default function Gas({ index, gas, strategy, removable }: GasProps) {
  const [oxygen, setOxygenLevel] = useState(gas.oxygen);
  const [helium, setHeliumLevel] = useState(gas.helium);
  const queryClient = useQueryClient();

  const updateGasMutation = useMutation({
    mutationFn: () => {
      return axios.put(`api/decoweb/gasses/${gas.id}`, {
        strategy: gas.strategy,
        oxygen: oxygen,
        helium: helium,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["strategies", strategy.id],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["profiles"],
      });
    },
  });

  const removeGasMutation = useMutation({
    mutationFn: () => {
      return axios.delete(`api/decoweb/gasses/${gas.id}`);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches for that `queryKey`
      await queryClient.cancelQueries({
        queryKey: ["strategies", strategy.id],
        exact: true,
      });

      // Snapshot the previous value
      const prevGasses = queryClient.getQueryData([
        "strategies",
        strategy.id,
      ]) as GasType[];

      // Filter gasses
      const newGasses: GasType[] = prevGasses.filter(
        (prevGas: GasType) => gas.id != prevGas.id
      );

      // Optimistically update to the new value
      queryClient.setQueryData(["strategies", strategy.id], newGasses);

      // Return a context with the previous and new data
      return { prevGasses };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevGasses)
        queryClient.setQueryData(
          ["strategies", strategy.id],
          context.prevGasses
        );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["strategies", strategy.id],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["profiles"],
      });
      console.log(gas);
      setOxygenLevel(gas.oxygen);
      setHeliumLevel(gas.helium);
    },
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
            Gas {index + 1} ({gas.id})
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
