mapboxgl.accessToken =
  'pk.eyJ1IjoibTNpZGEiLCJhIjoiY2t5YWUwcWJhMDRtYzJ3bzh4aXdzaXR5biJ9.fSgha4dxWzm65sez1AZ7HA';

if ($('#new_map').length) {
  const map = new mapboxgl.Map({
    container: 'new_map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-16.883055555556, 32.648888888889], // starting position
    zoom: 12, // starting zoom
  });

  // Add geolocate control to the map.
  map.addControl(
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

  $('#newpub').on('transitionstart', () => {
    setInterval(() => map.resize(), 300);
  });

  $('#newpub').submit(function (eventObj) {
    $('#newpub input[name=lat]').attr('value', map.getCenter().lat);
    $('#newpub input[name=lng]').attr('value', map.getCenter().lng);

    return true;
  });
}

async function pubs() {
  return fetch('/api/pubs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((data) => {
    return data.json();
  });
}

$(window).ready(async () => {
  const data = await pubs();

  const treatedData = data.map((el) => {
    return {
      type: 'Feature',
      properties: {
        href: '#pub' + el.id,
        iconSize: [13.5, 18],
      },
      geometry: {
        type: 'Point',
        coordinates: [el.lg, el.lat],
      },
    };
  });

  const geojson = {
    type: 'FeatureCollection',
    features: treatedData,
  };

  for (const marker of geojson.features) {
    // Create a DOM element for each marker.
    // const el = document.createElement('a');
    // const width = marker.properties.iconSize[0];
    // const height = marker.properties.iconSize[1];
    // el.className = 'marker';
    // el.style.width = `${width}px`;
    // el.style.height = `${height}px`;
    // el.setAttribute('href', marker.properties.href);
    // el.innerHTML = '<i class="fas fa-map-marker-alt"></i>';

    // el.addEventListener('click', () => {
    //   $(marker.properties.href).addClass('animate__animated animate__bounceIn');
    // });

    // Add markers to the map.
    const marcador = new mapboxgl.Marker()
      .setLngLat(marker.geometry.coordinates)
      .addTo(mapMain);

    marcador.getElement().classList.add('marker');
    marcador.getElement().setAttribute('href', marker.properties.href);
    marcador.getElement().addEventListener('click', () => {
      const publicacao = marcador.getElement().getAttribute('href');
      const body = $('html, body');

      body.stop().animate(
        { scrollTop: $(publicacao).offset().top },
        {
          easing: 'swing',
          duration: 200,
          complete: function () {
            setTimeout(() =>
              $(publicacao).addClass('animate__animated animate__bounceIn'),
              400
            );
          },
        }
      );
    });
  }
});

$('.publication').on('animationend', (e) => {
  $(e.target).removeClass('animate__animated animate__bounceIn');
});

const mapMain = new mapboxgl.Map({
  container: 'mapMain',
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
