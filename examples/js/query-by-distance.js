var
map         = null,
layer       = null,
circle      = null,

// Circle propierties
radius      = 300000,
radDeg      = 0,

// Initial coordinates
lat         = 40.7248057566452,
lng         = -73.9967118782795,
initialZoom = 5,

// CartoDB setup
userName    = "examples",
tableName   = 'points_na',

// Styling
markerStyle = "#{{table_name}}{marker-fill:#F55; marker-line-color:#F55;}",
mapStyle    = [ { stylers: [ { saturation: -65 }, { gamma: 1.52 } ] }, { featureType: "administrative", stylers: [ { saturation: -95 },{ gamma: 2.26 } ] }, { featureType: "water", elementType: "labels", stylers: [ { visibility: "off" } ] }, { featureType: "administrative.locality", stylers: [ { visibility: 'off' } ] }, { featureType: "road", stylers: [ { visibility: "simplified" }, { saturation: -99 }, { gamma: 2.22 } ] }, { featureType: "poi", elementType: "labels", stylers: [ { visibility: "off" } ] }, { featureType: "road.arterial", stylers: [ { visibility: 'off' } ] }, { featureType: "road.local", elementType: "labels", stylers: [ { visibility: 'off' } ] }, { featureType: "transit", stylers: [ { visibility: 'off' } ] }, { featureType: "road", elementType: "labels", stylers: [ { visibility: 'off' } ] },{ featureType: "poi", stylers: [ { saturation: -55 } ] } ];

var updateLayer = function(){

  // Our main query
  var query = "SELECT * FROM {{table_name}} WHERE ST_Intersects (the_geom, ST_Buffer(ST_SetSRID('POINT(" + lng + " " + lat + ")'::geometry , 4326), " + getRagDeg(radius) + "))";

  if (layer) {
    layer.setOptions({ query: query });
    return;
  }

  // Create layer
  layer = new CartoDBLayer({
    map: map,
    user_name: userName,
    table_name: tableName,
    query: query,
    layer_order: "top",
    tile_style: markerStyle,
    interactivity: "cartodb_id"
  });
};

// Calculates the radius of the circle
var getRagDeg = function(dist) {
  var deg = 180;
  var brng = deg * Math.PI / 180;
  dist = dist/6371000;
  var lat1 = lat * Math.PI / 180;
  var lon1 = lng * Math.PI / 180;
  var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
                       Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
  var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                               Math.cos(lat1),
  Math.cos(dist) - Math.sin(lat1) *
    Math.sin(lat2));
  if (isNaN(lat2) || isNaN(lon2)) return null;
  return lat - (lat2 * 180 / Math.PI) ;
};

function drawCircle() {

  if (circle) { // Remove circle
    circle.setMap(null);
  }

  circle = new google.maps.Circle({
    map: map,
    center: new google.maps.LatLng(lat, lng),
    radius: radius,
    strokeColor: "#0000ff",
    strokeOpacity: 0.20,
    strokeWeight: 2,
    fillColor: "#0000ff",
    fillOpacity: 0.050,
    zIndex:0,
    clickable:false
  });
}

function init() {

  // Create map
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(lat, lng),
    zoom: initialZoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false
  });

  map.setOptions({styles: mapStyle});

  updateLayer();
  drawCircle();

  var onRangeMouseUp = function() {
    radius = parseInt($(this).val(), 10);
    updateLayer();
    drawCircle();
  };

  var onRangeChange = function(){
    radius = parseInt($(this).val(), 10);
    drawCircle();
  };

  // Bindings for the radius selector
  $('input[type="range"]').mouseup(onRangeMouseUp);
  $('input[type="range"]').change(onRangeChange);
}
