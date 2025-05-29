import { LineChart } from "@mui/x-charts/LineChart";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type DiveChartProps = {
  keyToLabel: Map<string, string>;
};

function getKeyToLabel(strategies: StrategyType[]): Map<string, string> {
  let keyToLabel = new Map<string, string>();
  strategies.data.forEach((strategy, i) => {
    keyToLabel.set(
      strategy.id,
      "Strategy " + (i + 1).toString() + " depth (m):"
    );
  });
  return keyToLabel;
}

export default function DiveChart({ strategies }: DiveChartProps) {
  const keyToLabel = getKeyToLabel(strategies);

  const diveProfiles = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await axios.get("decoweb/api/plan-dive");
      return response.data;
    },
  });

  if (diveProfiles.isLoading) return null;

  if (diveProfiles.isError) {
    console.log("Error: ", diveProfiles.error);
    return null;
  }

  return (
    <LineChart
      grid={{ horizontal: true }}
      xAxis={[
        {
          dataKey: "time",
          valueFormatter: (value) => value.toString() + " min",
        },
      ]}
      yAxis={[
        {
          reverse: true,
        },
      ]}
      series={Array.from(keyToLabel.keys()).map((key: string) => ({
        dataKey: key,
        label: keyToLabel.get(key),
        showMark: false,
        curve: "linear",
      }))}
      dataset={diveProfiles.data}
      height={300}
      legend={{ hidden: true }}
      margin={{ top: 10 }}
    />
  );
}
