// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/radar
import { ResponsiveRadar } from "@nivo/radar";
import { type RadarData } from "~/utils/radarData";
import { renderDotLabel } from "~/utils/radarData";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

const ChartRadar = ({ data }: { data: RadarData }) => {
  console.log(data);
  return (
    <ResponsiveRadar
      data={data}
      keys={["value"]}
      indexBy="index"
      valueFormat=">-.2f"
      isInteractive={false}
      margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
      borderColor={{ from: "color" }}
      gridLabelOffset={36}
      gridLabel={() => null}
      dotSize={10}
      gridLevels={4}
      maxValue={4}
      curve="linearClosed"
      enableDotLabel
      dotLabel={renderDotLabel}
      dotColor={{ theme: "background" }}
      dotBorderWidth={2}
      colors={"#FFBB01"}
      blendMode="normal"
      motionConfig="wobbly"
      fillOpacity={0.6}
    />
  );
};

export default ChartRadar;
