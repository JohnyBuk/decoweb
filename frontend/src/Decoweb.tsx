import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Collapse, Container } from "@mui/material";
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

  useEffect(() => {
    if (strategies.data?.length === 0 && !addStrategyMutation.isPending) {
      addStrategy();
    }
  }, [strategies.data]);

  const [gridCols, setGridCols] = useState(0);
  useEffect(() => {
    if (!strategies.data) return;
    const count = strategies.data.length;
    if (count >= gridCols) {
      setGridCols(count);
    } else {
      const id = setTimeout(() => setGridCols(count), 350);
      return () => clearTimeout(id);
    }
  }, [strategies.data?.length]);

  if (strategies.isLoading) return null;

  if (strategies.isError) {
    console.log("Error: ", strategies.error);
    return null;
  }

  return (
    <Container fixed sx={{ marginBottom: 10 }}>
      {<DiveChart strategies={strategies.data} />}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: gridCols > 1
            ? { xs: "1fr", md: "calc(50% - 8px) calc(50% - 8px)" }
            : "calc(100% - 0px) calc(0% - 0px)",
          columnGap: gridCols > 1 ? { xs: 0, md: 2 } : 0,
          rowGap: 2,
          mt: 3,
          transition: "grid-template-columns 350ms ease, column-gap 350ms ease",
        }}
      >
        <TransitionGroup component={null}>
          {strategies.data.map((strategy: StrategyType, i: number) => (
            <Collapse key={i}>
              <Strategy
                index={i}
                strategy={strategy}
                removable={strategies.data.length > 1}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </Box>
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
