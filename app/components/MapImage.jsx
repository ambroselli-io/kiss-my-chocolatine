import { useMap } from "react-map-gl";

export default function MapImage({ children }) {
  const mapHook = useMap();

  if (!mapHook?.current) return null;
  const map = mapHook.current;
  if (!map.hasImage("pin")) {
    let img = new Image(133, 150);
    img.onload = () => {
      if (!map.hasImage("pin")) map.addImage("pin", img);
    };
    img.onerror = () => {
      console.log("Failed to load image"); // Debug line
    };
    img.src = "/assets/marker.svg";
  }

  return children;
}
