import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Collapse, Container } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

import DiveChart from "./DiveChart";
import Strategy from "./Strategy";
import { StrategyType } from "./types";

export default function Decoweb() {
  const queryClient = useQueryClient();

  const strategies = useQuery({
    queryKey: ["strategies"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/decoweb/strategies?keep_empty=false"
      );
      return response.data;
    },
  });

  const addStrategyMutation = useMutation({
    mutationFn: (newStrategy: StrategyType) => {
      return axios.post(`api/decoweb/strategies?empty=false`, newStrategy);
    },
    onMutate: async (newStrategy: StrategyType) => {
      // Cancel any outgoing refetches for that `queryKey`
      await queryClient.cancelQueries({ queryKey: ["strategies"] });

      // Snapshot the previous value
      const prevStrategies = queryClient.getQueryData(["strategies"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["strategies"], (previous: StrategyType[]) => [
        ...previous,
        newStrategy,
      ]);

      // Return a context with the previous and new data
      return { prevStrategies };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevStrategies)
        queryClient.setQueryData(["strategies"], context.prevStrategies);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const addStrategy = () => {
    const newStrategy = {
      id: -1, // Temporary ID, will be replaced by the backend
      target_depth: 20,
      bottom_time: 10,
    } as StrategyType;
    addStrategyMutation.mutate(newStrategy);
  };

  if (strategies.isLoading) return null;

  if (strategies.isError) {
    console.log("Error: ", strategies.error);
    return null;
  }

  return (
    <Container fixed sx={{ marginBottom: 10 }}>
      {<DiveChart strategies={strategies.data} />}
      <TransitionGroup>
        {strategies.data.map((strategy: StrategyType, i: number) => (
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
        onClick={addStrategy}
      >
        Add strategy
      </Button>
    </Container>
  );
}
