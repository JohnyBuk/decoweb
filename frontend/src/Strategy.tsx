import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Collapse, Slider, Typography } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import axios from "axios";

import { GasType, StrategyType } from "./types";
import Gas from "./Gas";

type StrategyProps = {
  index: number;
  strategy: StrategyType;
  removable: boolean;
};

export default function Strategy({
  index,
  strategy,
  removable,
}: StrategyProps) {
  const [targetDepth, setTargetDepth] = useState(strategy.target_depth);
  const [bottomTime, setBottomTime] = useState(strategy.bottom_time);
  const queryClient = useQueryClient();

  const gasses = useQuery({
    queryKey: ["strategies", strategy.id],
    queryFn: async () => {
      if (strategy.id < 0) {
        return [];
      }
      const response = await axios.get(
        `api/decoweb/strategies/${strategy.id}/gasses`
      );
      return await response.data;
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: () => {
      return axios.put(`api/decoweb/strategies/${strategy.id}`, {
        target_depth: targetDepth,
        bottom_time: bottomTime,
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

  const removeStrategyMutation = useMutation({
    mutationFn: () => {
      return axios.delete(`api/decoweb/strategies/${strategy.id}`);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches for that `queryKey`
      await queryClient.cancelQueries({ queryKey: ["strategies"] });

      // Snapshot the previous value
      const prevStrategies = queryClient.getQueryData([
        "strategies",
      ]) as StrategyType[];

      const newStrategies = prevStrategies.filter(
        (prevStrategy) => strategy.id != prevStrategy.id
      );

      // Optimistically update to the new value
      queryClient.setQueryData(["strategies"], newStrategies);

      // Return a context with the previous and new data
      return { prevStrategies };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevStrategies)
        queryClient.setQueryData(["strategies"], context.prevStrategies);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setTargetDepth(strategy.target_depth);
      setBottomTime(strategy.bottom_time);
    },
  });

  const addGasMutation = useMutation({
    mutationFn: (newGass: GasType) => {
      return axios.post(`api/decoweb/gasses`, newGass);
    },
    onMutate: async (newGass: GasType) => {
      // Cancel any outgoing refetches for that `queryKey`
      await queryClient.cancelQueries({
        queryKey: ["strategies", strategy.id],
        exact: true,
      });

      // Snapshot the previous value
      const prevData = queryClient.getQueryData(["strategies", strategy.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["strategies", strategy.id],
        (previous: GasType[]) => [...previous, newGass]
      );

      // Return a context with the previous and new data
      return { prevData };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevData)
        queryClient.setQueryData(["strategies", strategy.id], context.prevData);
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
    },
  });

  const addGas = () => {
    const newGas = {
      strategy: strategy.id,
      oxygen: 21,
      helium: 0,
    } as GasType;
    addGasMutation.mutate(newGas);
  };

  if (gasses.isError) {
    console.log("Error: ", gasses.error);
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: "#1976d2",
        borderRadius: 1,
        p: 1,
        marginBottom: 3,
        marginTop: index === 0 ? 3 : 0,
      }}
    >
      <Typography variant="h5" color="white" mb={1}>
        Strategy {index + 1} ({strategy.id})
      </Typography>

      <Grid container columnSpacing={5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography>Target Depth {targetDepth} meters</Typography>
          <Box p={2}>
            <Slider
              value={targetDepth}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChange={(_event, value, _) => {
                setTargetDepth(value as number);
              }}
              onChangeCommitted={(_event, _) => {
                updateStrategyMutation.mutate();
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography>Bottom time {bottomTime} minues</Typography>
          <Box p={2}>
            <Slider
              value={bottomTime}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChange={(_event, value, _) => {
                setBottomTime(value as number);
              }}
              onChangeCommitted={(_event, _) => {
                updateStrategyMutation.mutate();
              }}
            />
          </Box>
        </Grid>
      </Grid>
      {gasses.isLoading ? null : (
        <TransitionGroup>
          {gasses.data.map((gas: GasType, i: number) => (
            <Collapse key={i}>
              <Gas
                key={i}
                index={i}
                gas={gas}
                strategy={strategy}
                removable={gasses.data.length > 1}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      )}
      <Box display={"flex"} justifyContent={"space-between"}>
        <Button
          variant="outlined"
          disableElevation
          startIcon={<DeleteIcon />}
          disabled={!removable}
          onClick={() => removeStrategyMutation.mutate()}
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
          onClick={addGas}
          sx={{
            backgroundColor: "white",
            color: "#1976d2",
          }}
        >
          Add gas
        </Button>
      </Box>
    </Box>
  );
}
