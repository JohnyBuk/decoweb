import { LineChart } from "@mui/x-charts/LineChart";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type DivePointType = {
  [key: string]: string;
};

type DiveChartProps = {
  keyToLabel: Map<string, string>;
};

export default function DiveChart({ keyToLabel }: DiveChartProps) {
  const diveProfiles = useQuery({
    queryKey: ["strategies", "diveProfiles"],
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
