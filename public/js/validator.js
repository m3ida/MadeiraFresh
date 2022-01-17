async function local(lng, lat) {
  return fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoibTNpZGEiLCJhIjoiY2t5YWUwcWJhMDRtYzJ3bzh4aXdzaXR5biJ9.fSgha4dxWzm65sez1AZ7HA`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then((data) => {
    return data.json();
  });
}

$(window).ready(async () => {
  $('.coords').each(async function () {
    const coords = $(this).text().trim().split(',');
    const localizacao = await local(coords[0], coords[1]);
    $(this).text(
    //   localizacao.features[0].context[1].text +
    //     ', ' +
    //     localizacao.features[0].context[2].text
    localizacao.features[0].place_name
    );
  });
});

$('input[type=checkbox]').click(function () {
  var checkedBox = $(this);
  if ($(this).is(':checked')) {
    $(this)
      .parent()
      .parent()
      .children('.val, .del')
      .children('input')
      .prop('checked', false);
    checkedBox.prop('checked', true);
  }
});
