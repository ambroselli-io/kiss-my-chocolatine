import MapBoxGL from "mapbox-gl";
import ReactDOM from "react-dom";
import CustomPopup from "../components/Popup";

const MapboxService = class {
  init = (container, map, nav, center, data) =>
    new Promise((res) => {
      MapBoxGL.accessToken = window.ENV.MAPBOX_ACCESS_TOKEN;
      map.current = new MapBoxGL.Map({
        container: container.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center,
        zoom: 15,
        // antialias: true,
        // cooperativeGestures: false,
        // doubleClickZoom: false,
      });
      nav.current = new MapBoxGL.NavigationControl({
        visualizePitch: true,
      });
      map.current.addControl(nav.current, "bottom-right");
      let img = new Image(133, 150);
      img.onload = () => map.current.addImage("pin", img);
      img.src = "/assets/marker.svg";
      map.current.on("load", async () => {
        this.map = map.current;
        await this.getData({ data });
        if (this.shopMarkerQueue) {
          this.addCurrentShopMarker(this.shopMarkerQueue);
          this.shopMarkerQueue = null;
        }
        res();
      });
    });

  getData = async ({ data, source = "shops" }) => {
    this.map.addSource(source, {
      type: "geojson",
      data,
    });
    this.map.addLayer({
      id: "shops",
      type: "symbol",
      source: "shops",
      layout: {
        "icon-image": "pin",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-size": 0.2,
        "icon-offset": [0, -75],
      },
    });

    // Change the cursor to a pointer when the mouse is over the shops layer.
    this.map.on("mouseenter", "shops", () => {
      this.map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    this.map.on("mouseleave", "shops", () => {
      this.map.getCanvas().style.cursor = "";
    });

    this.createOnMouseUp();
  };

  enableNavToShop = async (navigate) => {
    this.map.on("click", "shops", (e) => {
      const properties = e.features[0].properties;
      const featureId = properties._id;
      navigate(`/shop/${featureId}`);
    });
  };

  addCurrentShopMarker = (feature) => {
    if (!this.map) {
      this.shopMarkerQueue = feature;
      return;
    }
    if (this.currentShopLayer) this.map.removeLayer("current-shop");
    if (this.currentShopSource) this.map.removeSource("current-shop");
    this.currentShopSource = this.map.addSource("current-shop", {
      type: "geojson",
      data: feature,
    });
    this.currentShopLayer = this.map.addLayer({
      id: "current-shop",
      type: "symbol",
      source: "current-shop",
      layout: {
        "icon-image": "pin",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-size": 0.4,
        "icon-offset": [0, -75],
      },
    });
  };

  showPopup = () => {
    // When a click event occurs on a feature in the shops layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    this.map.on("click", "shops", (e) => {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const markerHeight = 50;
      const markerRadius = 10;
      const linearOffset = 25;
      const popupOffsets = {
        top: [0, 0],
        "top-left": [0, 0],
        "top-right": [0, 0],
        bottom: [0, -markerHeight],
        "bottom-left": [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
        "bottom-right": [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
        left: [markerRadius, (markerHeight - markerRadius) * -1],
        right: [-markerRadius, (markerHeight - markerRadius) * -1],
      };

      // https://stackoverflow.com/a/50713162/5225096
      const placeholder = document.createElement("div");
      ReactDOM.render(<CustomPopup {...e.features[0].properties} />, placeholder);

      new MapBoxGL.Popup({ offset: popupOffsets })
        .setDOMContent(placeholder)
        .setLngLat(coordinates)
        .addTo(this.map);
    });
  };

  createOnMouseUp = () => {
    this.map.on("mouseup", async (event) => {
      console.log([event.lngLat.lng, event.lngLat.lat]);
    });
    // map.on("mouseup", async (event) => {
    //   console.log(event.lngLat); // { lat: lng: }
    //   const name = await getShopName("Nom du magasin");
    //   if (!name) return;
    //   fetch(`${API_URL}/shop`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Accept: "application/json",
    //     },
    //     body: JSON.stringify({
    //       coordinates: [event.lngLat.lng, event.lngLat.lat],
    //       name,
    //     }),
    //   })
    //     .then((res) => res.json())
    //     .then(console.log)
    //     .catch(console.log);
    // });
  };
};

const MyMap = new MapboxService();
export default MyMap;
