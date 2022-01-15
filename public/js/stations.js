mapboxgl.accessToken =
    'pk.eyJ1IjoibTNpZGEiLCJhIjoiY2t5YWUwcWJhMDRtYzJ3bzh4aXdzaXR5biJ9.fSgha4dxWzm65sez1AZ7HA';
  aqiapitoken = 'b626c215fdc91838498402333e622a5b88d32a49';

  const mapMain = new mapboxgl.Map({
    container: 'stations-container',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-16.883055555556, 32.648888888889],
    zoom: 11,
  });

  mapMain.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true,
    })
  );

  async function stations() {
    return fetch(
      'https://api.waqi.info/map/bounds/?token=' +
        aqiapitoken +
        '&latlng=32.61207404313467,-17.128470228823087,32.73141716292992,-16.852202693421546',
      {
        method: 'GET',
      }
    ).then((data) => {
      return data.json();
    });
  }

  async function getExtendedAQI(data) {
    return fetch(
      'https://api.waqi.info/feed/@' + data.uid + '/?token=' + aqiapitoken,
      {
        method: 'GET',
      }
    ).then(function (response) {
      return response.json();
    });
  }

  $(window).ready(async () => {
    const data = await stations();

    for (const estacao of data.data) {

      const extended_aqi = await getExtendedAQI(estacao);

      const iaqi_h = extended_aqi.data.iaqi.h
        ? '<p>Humidade: ' + extended_aqi.data.iaqi.h.v + '</p>'
        : '';
      const iaqi_no2 = extended_aqi.data.iaqi.no2
        ? '<p>NO2: ' + extended_aqi.data.iaqi.no2.v + '</p>'
        : '';
      const iaqi_o3 = extended_aqi.data.iaqi.o3
        ? '<p>O3: ' + extended_aqi.data.iaqi.o3.v + '</p>'
        : '';
      const iaqi_pm10 = extended_aqi.data.iaqi.pm10
        ? '<p>PM10: ' + extended_aqi.data.iaqi.pm10.v + '</p>'
        : '';
      const iaqi_pm25 = extended_aqi.data.iaqi.pm25
        ? '<p>PM2.5: ' + extended_aqi.data.iaqi.pm25.v + '</p>'
        : '';
      const iaqi_t = extended_aqi.data.iaqi.t
        ? '<p>Temperatura: ' + extended_aqi.data.iaqi.t.v + '</p>'
        : '';

      const values =
        iaqi_t + iaqi_h + iaqi_no2 + iaqi_o3 + iaqi_pm10 + iaqi_pm25;

      const popup = new mapboxgl.Popup({
        offset: 25,
        focusAfterOpen: false,
      }).setHTML(
        '<h6>Estação de ' +
          estacao.station.name.split(',')[0] +
          '</h6> <p>AQI: ' +
          estacao.aqi +
          '<p>' +
          values
      );

      new mapboxgl.Marker()
        .setLngLat([estacao.lon, estacao.lat])
        .setPopup(popup)
        .addTo(mapMain);
    }
  });