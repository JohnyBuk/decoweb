import { Box, Button, Collapse, Slider, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import Gas from "./Gas.js";
import { useContext, useState } from "react";
import { DivePlanContext } from "./context.js";
import { DivePlanActionType } from "./reducer.js";
import { TransitionGroup } from "react-transition-group";
import { GasType, StrategyType } from "./types.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type StrategyProps = {
  id: number;
  strategy: StrategyType;
  removable: boolean;
};

export default function Strategy({ id, strategy, removable }: StrategyProps) {
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
        `decoweb/api/strategies/${strategy.id}/gasses`
      );
      return await response.data;
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: () => {
      return axios.put(`decoweb/api/strategies/${strategy.id}`, {
        target_depth: targetDepth,
        bottom_time: bottomTime,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["strategies"]);
    },
  });

  const removeStrategyMutation = useMutation({
    mutationFn: () => {
      return axios.delete(`decoweb/api/strategies/${strategy.id}`);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches for that `queryKey`
      await queryClient.cancelQueries({ queryKey: ["strategies"] });

      // Snapshot the previous value
      const prevStrategies = queryClient.getQueryData(["strategies"]);
      const newStrategies = prevStrategies.filter(
        (prevStrategy) => strategy.id != prevStrategy.id
      );

      // Optimistically update to the new value
      queryClient.setQueryData(["strategies"], newStrategies);

      // Return a context with the previous and new data
      return prevStrategies;
    },
    onError: (err, newStrategy, context) => {
      queryClient.setQueryData(["strategies"], context.prevStrategies);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });

  const addGasMutation = useMutation({
    mutationFn: () => {
      return axios.post(`decoweb/api/gasses`, {
        strategy: strategy.id,
        oxygen: 21,
        helium: 0,
      });
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({
        queryKey: ["strategies", strategy.id],
        exact: true,
      }),
  });

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
        marginTop: id === 0 ? 3 : 0,
      }}
    >
      <Typography variant="h5" color="white" mb={1}>
        Strategy {id + 1}
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
          {gasses.data.map((gas, i) => (
            <Collapse key={i}>
              <Gas
                key={i}
                id={i}
                gas={gas}
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
          onClick={() => addGasMutation.mutate()}
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
