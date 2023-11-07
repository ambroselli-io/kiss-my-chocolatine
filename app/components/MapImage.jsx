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
  if (!map.hasImage("marker-gray")) {
    let markerWhite = new Image(133, 150);
    markerWhite.onload = () => {
      if (!map.hasImage("marker-gray"))
        map.addImage("marker-gray", markerWhite);
    };
    markerWhite.src = "/assets/marker-gray.svg";
  }
  if (!map.hasImage("marker-full-black")) {
    let markerFullBlack = new Image(133, 150);
    markerFullBlack.onload = () => {
      if (!map.hasImage("marker-full-black"))
        map.addImage("marker-full-black", markerFullBlack);
    };
    markerFullBlack.src = "/assets/marker-full-black.svg";
  }

  return children;
}
