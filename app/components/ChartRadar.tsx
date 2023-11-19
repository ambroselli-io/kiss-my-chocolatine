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
  return (
    <ResponsiveRadar
      data={data}
      keys={["value"]}
      indexBy="index"
      valueFormat=">-.2f"
      isInteractive={false}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      borderColor={{ from: "color" }}
      gridLabelOffset={36}
      gridLabel={() => null}
      dotSize={10}
      gridLevels={5}
      maxValue={5}
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
