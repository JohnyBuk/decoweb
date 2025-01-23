import { LineChart } from "@mui/x-charts/LineChart";

export default function DiveChart({ diveProfiles, keyToLabel }) {
  return (
    <LineChart
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
      series={Object.keys(keyToLabel).map((key) => ({
        dataKey: key,
        label: keyToLabel[key],
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
