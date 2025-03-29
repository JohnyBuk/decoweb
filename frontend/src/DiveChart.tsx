import { LineChart } from "@mui/x-charts/LineChart";

type DivePointType = {
  [key: string]: string;
};

type DiveChartProps = {
  diveProfiles: DivePointType[];
  keyToLabel: Map<string, string>;
};

export default function DiveChart({
  diveProfiles,
  keyToLabel,
}: DiveChartProps) {
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
      // series={Object.keys(keyToLabel).map((key) => ({
      series={Array.from(keyToLabel.keys()).map((key: string) => ({
        dataKey: key,
        label: keyToLabel.get(key),
        showMark: false,
        curve: "linear",
      }))}
      dataset={diveProfiles}
      height={300}
      legend={{ hidden: true }}
      margin={{ top: 10 }}
    />
  );
}
