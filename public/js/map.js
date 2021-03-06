/*global $,extend,localStorage,formatLegend*/


function MapContainer(parent,options,callback){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  const self   = this;
  this.pointer = function(){return self;};
  this.callback=callback;
  // this.filteredids=[];
  this.construct();
}



MapContainer.prototype = {
  options:{
    zoom:3,
    hoverquery:false,
    center:[-100.00,60.0],
    paint:{
      hex:{"fill-outline-color": "rgba(0,0,0,0.0)","fill-color": "rgba(0,0,0,0.0)"},
      meit: {"fill-outline-color": "rgba(0,0,0,0.5)","fill-color": "rgba(0,0,0,0.1)"},
      prov: {"fill-outline-color": "rgba(0,0,0,0.5)","fill-color": "rgba(0,0,0,0.1)"},
      label: {'text-color': 'black'},
      // trips: {'circle-color': 'red','circle-radius':3},
      
    },
    layout:{
      hide:{'visibility':'none'},
      pts:{ "icon-image": "circle-11", "icon-allow-overlap": true},
      terminal:{ "icon-image": "{icon}-15", "icon-allow-overlap": true},
      terminal2:{ "icon-image": "{icon}-15"},
      meitlabel:{ 'text-size':16,'text-field': '{meitid}',
                      "text-allow-overlap":false,"text-ignore-placement":false,"text-optional":false,
                      "text-max-width":32,
                      "icon-allow-overlap":true,"icon-ignore-placement":true,"icon-optional":true,
            },
      provlabel:{'visibility':'none', 
                  'text-size':16,'text-field': '{province}',
                  "text-allow-overlap":false,"text-ignore-placement":false,"text-optional":false,
                  "text-max-width":32,
                  "icon-allow-overlap":true,"icon-ignore-placement":true,"icon-optional":true,
            },            
    },
    viewlayers:{
      mapmeit:{geo:'mapmeit',label:'meitlabels',property:'gid'},
      prov:{geo:'prov',label:'provlabels',property:'gid'},
      hex16:{geo:"hex16",property:'name'},
      hex4:{geo:"hex4",property:'name'},
      hex1:{geo:"hex1",property:'name'},
    }
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get keywords(){return this.parent.keywords;},
  get emission(){return this.parent.emission;},
  get language(){return this.parent.language;},
  get unit(){return this.parent.unit;},
  get mapd(){return this.parent.mapd;},
  get hoverquery(){return this.options.hoverquery;},
  set hoverquery(value){this.options.hoverquery=value;},
  get unitdname(){return this.parent.unitdname;},
  get divider(){return this.parent.divider;},
  get mapLayer(){return this.parent.mapLayer;},
  set mapLayer(value){this.parent.mapLayer=value;},
  get mapDLayer(){return this.parent.mapDLayer;},
  get KEYS(){return this.parent.KEYS;},
  get cache(){return this.mapd.cache;},
  get center(){return this.options.center;},
  set center(value){this.options.center=value;},
  get zoom(){return this.options.zoom;},
  // set zoom(value){this.options.zoom=value;},
  set zoom(value){
    if(value !==this.options.zoom){
      this.options.zoom=value;
      if(this.parent.setmapDLayer()){
        this.changeLayer();
      }
      // const mapLayer=this.mapLayer;
      // const zoom = value;
      // if(mapLayer==='mapmeit'||mapLayer==='prov'){this.parent.mapDLayer=mapLayer;return;}
      // for(let key in this.geomaps){
      //     let layer = this.geomaps[key];
      //     if(zoom >=layer.minimum && zoom<=layer.maximum)this.parent.mapDLayer=key;
      // }
    }
  },
  // get hexLayer(){
  //   for(let key in this.geomaps){
  //     let layer = this.geomaps[key];
  //     if(this.zoom >=layer.minimum && this.zoom<=layer.maximum)return key;
  //   }
  // },
  construct:function(){
    const self=this;
    mapboxgl.accessToken=this.KEYS.mapbox;
    this.readTerminals(function(){
      self.createMap();
    });
  },
  createMap:function(){    
    const map =this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/light-v9',
      center: this.center,
      zoom: this.zoom, 
      pitchWithRotate:false,
      dragRotate:false,
      touchZoomRotate:false,
    });
    const self=this;
    map.addControl(new mapboxgl.ScaleControl({position: 'top-left'}));
    map.addControl(new mapboxgl.NavigationControl());
    const mapLanguage = this.mapLanguage = new MapboxLanguage({supportedLanguages:['en','fr'],defaultLanguage:this.language});
    map.addControl(mapLanguage);
    map.addControl(new MapboxGeocoder({accessToken: mapboxgl.accessToken,country:'CA',zoom:12,limit:10,terminals:this.terminals}),'top-left');
    map.on("error",function(e){return self.error(e);});
    map.on("zoomend",debounce(function(e){self.onMove(e)}, 1000));
    // map.on("click",debounce(function(e){self.onClick(e)}, 1000));
    map.on("click",function(e){self.onClick(e)});
    map.on("dragend",debounce(function(e){self.onMove(e)}, 1000));
    map.on('mousedown', debounce(function(e){self.mouseDown(e)}, 10));
    map.on('touchstart',debounce(function(e){self.mouseDown(e)}, 10));
    map.on('mouseup', debounce(function(e){self.mouseUp(e)}, 10));
    map.on('mouseout', debounce(function(e){self.mouseUp(e)}, 10));
    map.on('mouseleave', debounce(function(e){self.mouseUp(e)}, 10));
    map.on('touchend',debounce(function(e){self.mouseUp(e)}, 10));
    map.on('touchcancel',debounce(function(e){self.mouseUp(e)}, 10));
    map.on('mousemove',debounce(function(e){self.mouseMove(e)}, 10));
    map.on('touchmove',debounce(function(e){self.mouseMove(e)}, 10));
    map.on('load', function () {self.loaded();});
  },
  setLanguage:function(language){
    
    // console.log("setLanguage",this,this.mapLanguage)
    this.map.setStyle(this.mapLanguage.setLanguage(this.map.getStyle(),language));
  },
  readTerminals: function(callback){
    const self=this;
    d3.json("/js/terminals.json", function(data) {
       self.terminals = data;
        callback();
    });
  },
  loaded:function(){
    $(".mapboxgl-ctrl-geocoder input").attr("keyword","search");
    $(".mapboxgl-ctrl-geocoder input").attr("keywordType","placeholder");
    this.addSources();
    this.addLayers();
    this.addSelectButton();
    
    this.selectBox = new SelectBox(this.pointer);
    this.popup = new mapboxgl.Popup({closeButton: false,closeOnClick: false});
    const element = d3.select($(".mapboxgl-ctrl-top-right")[0]);
    this.legenddiv = element.append('div').attr('class','mapboxgl-ctrl-group legend');
    this.callback();
  },
  addExtentHtml:function(){
    const html =       `
    <div class="inside extentinside">
          <div>
          <div class="row">
            <div class="col-sm-8">
              <div class="extentheader" keyword="extent" keywordType="text">Extent</div>
            </div>
            <div class="col-sm-4">
                <a class="clearpanel" style="float: right;" keyword="clear" keywordType="text">clear</a>
            </div>
          </div>
            <div class="row">
              <div class="col-sm-4"></div>
              <div class="col-sm-4">
                <input type="number" step="0.01" placeholder="Latitude" class="form-control coord" id="lat2" group="box" name="point2">
              </div>
              
            </div>
            <div class="row">
              <div class="col-sm-5">
                <input type="number" step="0.01" placeholder="Longitude" class="form-control coord" id="lon1" group="box" name="point1">
              </div>
              <div class="col-sm-2"></div>
              <div class="col-sm-5">
                <input type="number" step="0.01" placeholder="Longitude" class="form-control coord" id="lon2" group="box" name="point2">
              </div>
            </div>
            <div class="row">
              <div class="col-sm-4"></div>
              <div class="col-sm-4">
                <input type="number" step="0.01" placeholder="Latitude" class="form-control coord" id="lat1" group="box" name="point1">
              </div>
              <div class="col-sm-4"></div>
            </div>
            
          </div>
      </div>`;    
      return html;
  },
  addFilterHtml:function(){
    const html =       `
    <div class="inside filterinside">
          <div class="row">
            <div class="col-sm-8">
              <div class="extentheader" keyword="filters" keywordType="text">Filters</div>
            </div>
            <div class="col-sm-4">
                <a class="filterclear" style="float: right;" keyword="clear" keywordType="text">clear</a>
            </div>
          </div>
          <div class="row">
          <div class="pillcontainer"></div>
              
          </div>
      </div>`;
      return html;
  },
  addLegend:function(minmax,colors){
                // .domain([1,1E3,1E6,1E9,1E12,1E15])
            // .range(['#66c2a5','#abdda4','#e6f598','#fee08b','#fdae61','#f46d43']);
    const self=this;
    const min = minmax[0];
    const max = minmax[1];
  
    const array = [0,1,2,3,4,5,6,7].map(v=>(max-min)*(v/7)+min);
      
  
    const xscale= d3.scale.linear()
            .domain(array)
            .range(['#3288bd','#66c2a5','#abdda4','#e6f598','#fee08b','#fdae61','#f46d43','#d53e4f']);
            
    // const html = 
    // `<div class="mapboxgl-ctrl-group" style="height: 100px;width: 100px;background: white;float: right;margin: 10px;">
    //   <h5>Legend</h5>
      
    // </div>`;
    // const element = d3.select($(".mapboxgl-ctrl-top-right")[0]);
    // const div = element.append('div').attr('class','mapboxgl-ctrl-group legend');
    const div = this.legenddiv;
    var formatSi = d3.format(".2s");
    div.html("")
    const legendtext = this.language =='en'?this.keywords['legend']['en']:this.keywords['legend']['fr']
    // console.log(this.language,this.keywords['legend'])
    div.append('h5').text(legendtext).attr('keyword','legend').attr('keywordtype','text');
    array.forEach(value=>{
      const color = xscale(value);
      const item = div.append('div');
      item.append('span').attr('class','legend-key').style('background',color);
      item.append('span').text(formatLegend(value/self.divider) + " " + self.unit)  
    })
  },
  addSelectButton:function(){
    const self=this;
    let html = `
    <div class="selectpanel">
      {0}
      {1}
    </div>
    <div class="selectbtn boxselect">
      <button class="btn btn-light" data-toggle="tooltip" data-placement="bottom" title="extent" keyword="extent" keywordType="title"><i class="far fa-square fa-2x" aria-hidden="true"></i><i class="fa fa-mouse-pointer mpicon"></i></button>
    </div>
    <div class="selectbtn hoverquery">
      <button class="btn btn-light" data-toggle="tooltip" data-placement="bottom" title="query" keyword="query" keywordType="title"><i class="fas fa-info-circle fa-2x" aria-hidden="true"></i><i class="fa fa-mouse-pointer mpicon mpicon2"></i></button>
    </div>
    <div class="selectbtn trans">
      <div keyword="transparency" keywordType="text">Transparency</div>
      <input type="range" min="0" max="100" value="100" class="slider" id="TransRange">
    </div>
    `.format(this.addExtentHtml(),this.addFilterHtml());
    
    $(".mapboxgl-ctrl-top-left").append(html);
    const slider = document.getElementById("TransRange");


    slider.oninput =function(){self.setTrans(this.value)}
    $('.selectbtn.boxselect button').on("click",function(){$(this).blur();self.selectBox.activate();})
    
    $('.selectbtn.hoverquery button').on("click",function(e){
      $(this).blur();
      self.hoverquery=!self.hoverquery;
     
      (self.hoverquery)?$('.selectbtn.hoverquery button').addClass("active"):
                        $('.selectbtn.hoverquery button').removeClass("active");
      if(!(self.hoverquery))self.popup.remove();
      if(!(self.hoverquery))self.map.getCanvas().style.cursor = '';
    });
    $('.filterclear').on("click",function(){self.filterclear();})
  },
  setTrans:function(value){
    this.map.setPaintProperty('mapmeit', 'fill-opacity', value / 100);
    this.map.setPaintProperty('prov', 'fill-opacity', value / 100);
    this.map.setPaintProperty('hex16', 'fill-opacity', value / 100);
    this.map.setPaintProperty('hex4', 'fill-opacity', value / 100);
    this.map.setPaintProperty('hex1', 'fill-opacity', value / 100);
  },
    filterclear:function(){
    for(let id in this.parent.geomaps){
      this.parent.mapd.filterbyObj({id:id,filter:null});
      // this.parent.mapContainer.filteredids=[];
    }
    for(let id in this.parent.charts){
      const chart=this.parent.charts[id];
      chart.dc.removeFilters();
    }
    this.parent.mapd.draw();
  },
  error:function(e){
    if (e && e.error !== 'Error: Not Found')console.error(e);
  },
  addSources:function(){
    const URL = this.parent.options.URL;
    this.map.addSource('prov', {type: 'vector',tiles: [URL + "tiles/prov/{z}/{x}/{y}.pbf"]});
    this.map.addSource('cprov', {type: 'vector',tiles: [URL + "tiles/cprov/{z}/{x}/{y}.pbf"]});
    this.map.addSource('meit_S', {type: 'vector',tiles: [URL + "tiles/meit/{z}/{x}/{y}.pbf"]});
    this.map.addSource('meit_C', {type: 'vector',tiles: [URL + "tiles/cmeit/{z}/{x}/{y}.pbf"]});
    // this.map.addSource('hex', {type: 'vector',tiles: [URL + "tiles/hex/{z}/{x}/{y}.pbf"]});
    this.map.addSource('hex16', {type: 'vector',tiles: [URL + "tiles/hex16/{z}/{x}/{y}.pbf"]});
    this.map.addSource('hex4', {type: 'vector',tiles: [URL + "tiles/hex4/{z}/{x}/{y}.pbf"]});
    this.map.addSource('hex1', {type: 'vector',tiles: [URL + "tiles/hex1/{z}/{x}/{y}.pbf"]});
    this.map.addSource('terminalS', {type: 'vector',tiles: [URL + "tiles/terminals/{z}/{x}/{y}.pbf"]});
    // this.map.addSource('arcticpts', {type: 'vector',tiles: [URL + "tiles/arcticpts/{z}/{x}/{y}.pbf"]});
    // this.map.addSource('pacificpts', {type: 'vector',tiles: [URL + "tiles/pacificpts/{z}/{x}/{y}.pbf"]});
    // this.map.addSource('newgrid', {type: 'geojson',data:this.newgrid});
  },
  addLayers:function(){
    this.map.addLayer({"id": "mapmeit","type": "fill","source": 'meit_S',"source-layer": "meitregions","paint": this.options.paint.meit});
    this.map.addLayer({"id": "meitlabels","type": "symbol","source": 'meit_C',"source-layer": "cmeitregions",layout: this.options.layout.meitlabel,"paint": this.options.paint.label});
    this.map.addLayer({"id": "prov","type": "fill","source": 'prov',"source-layer": "provinces",layout:this.options.layout.hide,"paint": this.options.paint.prov});
    this.map.addLayer({"id": "provlabels","type": "symbol","source": 'cprov',"source-layer": "cprovinces",layout: this.options.layout.provlabel,"paint": this.options.paint.label});
    // this.map.addLayer({"id": "hexgrid","type": "fill","source": 'hex',"source-layer": "hex",layout:this.options.layout.hide,paint: this.options.paint.hex});
    this.map.addLayer({"id": "hex16","type": "fill","source": 'hex16',"source-layer": "hex",layout:this.options.layout.hide,paint: this.options.paint.hex});
    this.map.addLayer({"id": "hex4","type": "fill","source": 'hex4',"source-layer": "hex",layout:this.options.layout.hide,paint: this.options.paint.hex});
    this.map.addLayer({"id": "hex1","type": "fill","source": 'hex1',"source-layer": "hex",layout:this.options.layout.hide,paint: this.options.paint.hex});
    this.map.addLayer({"id": "terminals","type": "symbol","source": "terminalS","source-layer": "terminals",'layout': this.options.layout.terminal, "filter": ["==", "zoom", "0"]});
    this.map.addLayer({"id": "terminals5","type": "symbol","source": "terminalS","source-layer": "terminals",'layout': this.options.layout.terminal2,'minzoom': 10, "filter": ["==", "zoom", "1"]});
    this.map.addLayer({"id": "terminals2","type": "symbol","source": "terminalS","source-layer": "terminals",'layout': this.options.layout.terminal2,'minzoom': 11, "filter": ["==", "zoom", "2"]});
    this.map.addLayer({"id": "terminals1","type": "symbol","source": "terminalS","source-layer": "terminals",'layout': this.options.layout.terminal2,'minzoom': 12, "filter": ["==", "zoom", "3"]});
    // this.map.addLayer({"id": "arcticpts","type": "symbol","source": "arcticpts","source-layer": "pts",'layout': this.options.layout.pts});
    // this.map.addLayer({"id": "pacificpts","type": "symbol","source": "pacificpts","source-layer": "pts",'layout': this.options.layout.pts});
    // this.map.addLayer({"id": "newgrid","type": "fill","source": "newgrid",'paint': this.options.paint.hex});
  },

  // stops:[],
  // resetStops:function(){this.stops=[];},
  updateHexPaint:function(stops,minmax,colors){
    
    const self=this;
    const mapDLayer = this.mapDLayer;
    if(stops && stops.length && this.map.getLayer(mapDLayer)){
      const badge = this.mapd.badges[this.mapDLayer];
      stops=stops.map(stop=>{
        if(!badge || Object.keys(badge).length === 0) return stop;
        if(badge[stop[0]])return stop;
        
        stop[1]="#ccc";
        return stop;
      });
      // console.log(stops)
      self.map.setPaintProperty(mapDLayer, 'fill-color', {"property": this.options.viewlayers[mapDLayer].property,default: "rgba(0,0,0,0.0)","type": "categorical","stops": stops});
      self.addLegend(minmax,colors);
      // console.timeEnd("inside");
    }
  },
  changeLayer:function(_id){
    // this.mapLayer = (_id==="hexgrid")?:_id;//panelid
    this.hideLayer();
    this.mapLayer=_id;
    this.showLayer();
    this.mapd.getMap();
  },
  hideLayer:function(){
    
    const layers=this.options.viewlayers;
    for(let id in layers){
      const layer=layers[id];
       if(this.map.getLayer(layer.geo))this.map.setLayoutProperty(layer.geo, 'visibility', 'none');
       if(this.map.getLayer(layer.geo) && layer.label)this.map.setLayoutProperty(layer.label, 'visibility', 'none');
    }
  },

  showLayer:function(){
    const layers=this.options.viewlayers;
    const _id =this.mapDLayer;
    this.map.setLayoutProperty(layers[_id].geo, 'visibility', 'visible');
    if(layers[_id].label)this.map.setLayoutProperty(layers[_id].label, 'visibility', 'visible');
  },
  mouseDown:function(e){
    // e.originalEvent.preventDefault();
    if(this.selectBox && this.selectBox.active)return this.selectBox.down(e);
  },
  mouseMove:function(e){
    // e.originalEvent.preventDefault();
    if(this.selectBox && this.selectBox.active && this.selectBox.dragging)return this.selectBox.move(e);
    if(!(this.selectBox && this.selectBox.active) && this.hoverquery)this.hoverFeature(e,true);
    if(!(this.selectBox && this.selectBox.active) && !(this.hoverquery))this.hoverFeature(e,false);
  },
  mouseUp:function(e){
    // e.originalEvent.preventDefault();
    if(this.selectBox && this.selectBox.active && this.selectBox.dragging)return this.selectBox.up(e);
  },
  onClick:function(e){
    if(!this.hoverquery)return;
    
    const features = this.map.queryRenderedFeatures(e.point, { layers: [this.mapDLayer]});
    if (!features.length)return;
    
    if(this.mapDLayer=='mapmeit'){
      // const _id=features[0].properties.gid;
        // (!(this.filteredids.find(_=>_.id==_id)))?this.filteredids.push({id:_id,acc:'a_meitregion',label:_id}):this.filteredids.splice(this.filteredids.findIndex(_=>_.id==_id),1);
      const id=features[0].properties.meitid;
      this.parent.mapd.filterbyObj({id:this.mapDLayer,filter:id});
    } else {
      const id=(this.mapDLayer=='prov')?features[0].properties.gid:features[0].properties.name;
      const label=(this.mapDLayer=='prov')?features[0].properties.province:features[0].properties.name;
      const acc = (this.mapDLayer=='prov')?'a_prov':'a_hexgrid';
      // (!(this.filteredids.find(_=>_.id==_id)))?this.filteredids.push({id:_id,acc:acc,label:label}):this.filteredids.splice(this.filteredids.findIndex(_=>_.id==_id),1);
      this.parent.mapd.filterbyObj({id:this.mapDLayer,filter:id,label:label,acc:acc});  
    }
    this.parent.mapd.draw();
    
    
    
  },
  htmlPopup:function(feature){
    const gid=(this.mapDLayer=='mapmeit' || this.mapDLayer=='prov')?feature.properties.gid:feature.properties.name;
    let value = (this.cache[this.mapDLayer][gid]) ? this.cache[this.mapDLayer][gid].value / this.divider:0;
    value = value.toFixed(2);
    switch (this.mapDLayer) {
      case "mapmeit": return `{0} {1} <br> {2} {3}`.format(this.keywords["meitregion"][this.language],feature.properties.meitid,value,this.keywords[this.unit][this.language]);
      case "prov": return `{1} <br> {0}: {2} {3}`.format(this.keywords[this.emission][this.language],feature.properties.province,value,this.keywords[this.unit][this.language]);
       
      default: return `GID({1}) <br> {0}: {2} {3}`.format(this.keywords[this.emission][this.language],feature.properties.name,value,this.keywords[this.unit][this.language]);
    }
    
  },
  hoverFeature:function(e,con){
    if(!con)return;
    if(!(this.map.getLayer(this.mapDLayer)))return;
    const features = this.map.queryRenderedFeatures(e.point, { layers: [this.mapDLayer]});
    this.map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    if(con){
      if (!features.length)return this.popup.remove();
      this.popup.setLngLat(e.lngLat).setHTML(this.htmlPopup(features[0])).addTo(this.map);
      
      const _featuresTerminals = this.map.queryRenderedFeatures(e.point, { layers: ['terminals','terminals5','terminals2','terminals1']});
      if (!_featuresTerminals.length)return;
      const featuresTerminals = _featuresTerminals.find(feature => feature.layer.id==="terminals" || feature.layer.id==="terminals5" || feature.layer.id==="terminals2" || feature.layer.id==="terminals1" )    
      const value =featuresTerminals.properties.name
      this.popup.setLngLat(e.lngLat).setHTML(value).addTo(this.map);
    }
  },
  onMove:function(e){
    const distance = e.target.dragPan._startPos.dist(e.target.dragPan._pos);
    if (distance < 10)return this.map.fire('click');
    var lon1=this.map.getBounds()._sw.lng;
    var lat1=this.map.getBounds()._sw.lat;
    var lon2=this.map.getBounds()._ne.lng;
    var lat2=this.map.getBounds()._ne.lat;
    this.zoom=Math.floor(this.map.getZoom());
    this.bounds =[lon1,lat1,lon2,lat2];
    this.center = this.map.getCenter();
    
    
    
    // this.parent.mapd.filterMap();
    // this.parent.mapd.getTotalMap();
    
    // const obj = {mapLayer:this.parent.mapLayer,center:this.center};
    // this.parent.socket.emit("moving",obj);
    this.parent.mapd.getMap(true);
  },
  get bounds(){
    var lon1=this.map.getBounds()._sw.lng;
    var lat1=this.map.getBounds()._sw.lat;
    var lon2=this.map.getBounds()._ne.lng;
    var lat2=this.map.getBounds()._ne.lat;
    return [lon1,lat1,lon2,lat2];
  },


};

function SelectBox(parent){
  this._parent = parent;
  const self   = this;
  this.pointer = function(){return self;};
  this.id='boxactive';
  this.source='boxactive';
  this.active = false;
  this.dragging = false;
  this.hiding = true;
  this.paint = {"fill-outline-color": "rgba(0,0,0,0.0)","fill-color": "rgba(0,0,0,0.2)"};
  this.layout = {'visibility': 'none'};
  this.construct();
}
SelectBox.prototype = {
  get divbutton(){return $('.selectbtn.boxselect button')},
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  construct:function(){
    this.reset();
    this.map.addSource(this.source, {type: "geojson",data: this.bbox});
    this.map.addLayer({"id": this.id,"type": "fill","source": this.source,'layout': this.layout,"paint": this.paint});
    this.outlineBox = new OutlineBox(this.pointer);
    this.inputFunc();
  },
  // setPaint:function(paint){
  //   Object.keys(paint).forEach(prop=>this.map.setPaintProperty(this.id,prop,paint[prop]),this)
  // },
  inputFunc:function(){
    const self=this;
    $("#lat1").change(function(e){self.updateBBox();});
    $("#lon1").change(function(e){self.updateBBox();});
    $("#lat2").change(function(e){self.updateBBox();});
    $("#lon2").change(function(e){self.updateBBox();});  
    $('.clearpanel').on("click",function(){self.clear();})
  },
  updateBBox:function(){
    // console.log("updateBBox")
    this.start={lng:$("#lon1").val(),lat:$("#lat1").val()};
    this.end={lng:$("#lon2").val(),lat:$("#lat2").val()};
    this.update();
    this.outlineBox.bounds=this.bounds;
    this.outlineBox.show();
    this.updateMap();
  },
  reset:function(){
    this.start={lng:0,lat:0};
    this.end={lng:0,lat:0};
  },
  down:function(e){
    this.dragging = true;
    this.start = e.lngLat;
    this.end = e.lngLat;
    this.update();
  },
  move:function(e,callback){
    this.end = e.lngLat;
    this.update();
  },
  up:function(e){
    this.dragging = false;
    this.end = e.lngLat;
    this.update();
    this.deActivate();
    this.outlineBox.bounds=this.bounds;
    this.outlineBox.show();
    this.updateMap();
  },
  get bounds(){
    var minx=Math.min(this.start.lng,this.end.lng);
    var miny=Math.min(this.start.lat,this.end.lat);
    var maxx=Math.max(this.start.lng,this.end.lng);
    var maxy=Math.max(this.start.lat,this.end.lat);
    return [minx,miny,maxx,maxy];
  },
  get map(){return this.parent.map;},
  get bbox(){return turf.bboxPolygon(this.bounds);},
  get view(){return turf.difference(this.mapbbox,this.bbox);},
  update:function(){
    this.map.getSource(this.source)
                   .setData(this.view);
  },
  updateMap:function(){
    this.parent.parent.mapd.filterMap(this.bounds);
  },
  show:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'visible');
    this.hiding=false;
  },
  hide:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'none');
    this.hiding=true;
  },
  clear:function(){
    this.hide();
    this.outlineBox.hide();
    this.reset();
    this.updateMap();
  },
  activate:function(){
    this.active = true;
    this.divbutton.addClass("active")
    this.map.getCanvas().style.cursor = 'crosshair';
    this.map.dragPan.disable();
    // this.setPaint(this.activepaint);
    this.mapbbox = turf.bboxPolygon(this.parent.bounds);
    this.update();
    this.outlineBox.hide();
    if(this.hiding)this.show();
  },
  deActivate:function(){
    this.active = false;
    this.divbutton.removeClass("active")
    this.map.getCanvas().style.cursor = '';
    this.map.dragPan.enable();
    this.hide();
    // this.setPaint(this.paint);
  },
  
}

function OutlineBox(parent){
  this._parent = parent;
  this.id = 'boxselect';
  this.source = 'boxselect';
  this.layout = {'visibility': 'none'};
  this.paint = {"line-color": "rgba(255,0,0,1.0)"};
  this.construct();
  
}
OutlineBox.prototype = {
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get map(){return this.parent.parent.map;},
  get bounds(){if(!(this._bounds)){this._bounds = [0,0,0,0];}return this._bounds;},
  get bbox(){return turf.bboxPolygon(this.bounds);},

  set bounds(value){this._bounds=value;
    this.map.getSource(this.source)
            .setData(this.bbox);
    this.updatePanel();
  },
  construct:function(){
    this.map.addSource(this.source, {type: "geojson",data: this.bbox});
    this.map.addLayer({"id": this.id,"type": "line","source": this.source,'layout': this.layout,"paint": this.paint});
    
  },
  hide:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'none');
    this.hidePanel()
  },
  show:function(){
    this.map.setLayoutProperty(this.id, 'visibility', 'visible');
    this.showPanel()
  },
  showPanel:function(){
    $('.selectpanel .extentinside').addClass("active");
  },
  hidePanel:function(){
    $('.selectpanel .extentinside').removeClass("active");
  },
  updatePanel:function(){
    $("#lat1").val(this.bounds[1].toFixed(2));
    $("#lon1").val(this.bounds[0].toFixed(2));
    $("#lat2").val(this.bounds[3].toFixed(2));
    $("#lon2").val(this.bounds[2].toFixed(2));  
  },
  
}