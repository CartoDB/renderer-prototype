const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['collection-point']);
const viz = new carto.Viz('width: 100');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
