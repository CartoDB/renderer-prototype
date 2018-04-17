const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['multi-polygon']);
const viz = new carto.Viz('color: rgb(255, 0, 0)');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
