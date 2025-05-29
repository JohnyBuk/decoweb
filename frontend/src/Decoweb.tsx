import { useEffect, useState, useContext } from "react";
import { Button, Collapse, Container, Slider, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ScubaDivingIcon from "@mui/icons-material/ScubaDiving";
import Grid from "@mui/material/Grid2";
import { TransitionGroup } from "react-transition-group";
import DiveChart from "./DiveChart";
import Strategy from "./Strategy";
import { DivePlanActionType } from "./reducer";
import { getKeyToLabel, separateStrategies } from "./utils";
import { DivePlanContext } from "./context";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

type StrategyType = {
  id: number;
  target_depth: number;
  bottom_time: number;
};

export default function Decoweb() {
  const queryClient = useQueryClient();

  const strategies = useQuery({
    queryKey: ["strategies"],
    queryFn: async () => {
      const response = await axios.get("decoweb/api/strategies");
      return response.data;
    },
  });

  const addStrategyMutation = useMutation({
    mutationFn: (newStrategy: StrategyType) => {
      return axios.post(`decoweb/api/strategies?empty=false`, newStrategy);
    },
    onMutate: async (newStrategy) => {
      // Cancel any outgoing refetches for that `queryKey`
      await queryClient.cancelQueries({ queryKey: ["strategies"] });

      // Snapshot the previous value
      const prevData = queryClient.getQueryData(["strategies"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["strategies"], (previous) => [
        ...previous,
        newStrategy,
      ]);

      // Return a context with the previous and new data
      return prevData;
    },
    onError: (err, newStrategy, context) => {
      queryClient.setQueryData(["strategies"], context.prevData);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(["strategies"]);
    },
  });

  if (strategies.isLoading) return null;

  if (strategies.isError) {
    console.log("Error: ", strategies.error);
    return null;
  }

  return (
    <Container fixed sx={{ marginBottom: 10 }}>
      {<DiveChart strategies={strategies} />}
      <TransitionGroup>
        {strategies.data.map((strategy, i) => (
          <Collapse key={i}>
            <Strategy
              key={i}
              index={i}
              strategy={strategy}
              removable={strategies.data.length > 1}
            />
          </Collapse>
        ))}
      </TransitionGroup>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        disableElevation
        onClick={() =>
          addStrategyMutation.mutate({
            target_depth: 20,
            bottom_time: 10,
            id: -1, // Temporary ID, will be replaced by the server
          })
        }
      >
        Add strategy
      </Button>
    </Container>
  );
}
