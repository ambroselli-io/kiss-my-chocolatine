import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MapboxMap from "~/components/MapboxMap";

export const meta: MetaFunction = () => {
  return [
    { title: "Kiss my Chocolatine" },
    { name: "description", content: 'All the best "pains au chocolat" of Amsterdam!' },
  ];
};

export const loader = async () => {
  return {
    data: {
      type: "FeatureCollection",
      features: [],
      // features: shops.map(({ _id, name, location }) => ({
      //   type: "Feature",
      //   id: _id,
      //   geometry: location,
      //   properties: {
      //     _id,
      //     title: name,
      //   },
      // })),
    },
  };
};

export default function Index() {
  const { data } = useLoaderData();

  return <MapboxMap data={data} />;
}
