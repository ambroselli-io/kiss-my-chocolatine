import { useMap } from "react-map-gl";

export default function MapImage({ children }) {
  const mapHook = useMap();

  if (!mapHook?.current) return null;
  const map = mapHook.current;

  if (!map.hasImage("marker-black")) {
    let markerBlack = new Image(133, 150);
    markerBlack.onload = () => {
      if (!map.hasImage("marker-black"))
        map.addImage("marker-black", markerBlack);
    };
    markerBlack.src = "/assets/marker-black.svg";
  }
  if (!map.hasImage("marker-white")) {
    let markerWhite = new Image(133, 150);
    markerWhite.onload = () => {
      if (!map.hasImage("marker-white"))
        map.addImage("marker-white", markerWhite);
    };
    markerWhite.src = "/assets/marker-white.svg";
  }

  return children;
}
