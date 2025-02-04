/*global $,extend,options,Header,Login,Modal,Api,io*/

$(document).ready(function() {const app = new App(options);});

function App(options){
  this.options = extend(Object.create(this.options), options);
  const self   = this;
  this.pointer = function(){return self;};
  // this.api     = new Api();
  const hash = location.hash.substr(1);
  if(hash==='fr')this.language='fr';
  
  this.construct();
}

App.prototype ={
  options:{
    KEYS:{
      mapbox:'pk.eyJ1IjoianVsaWVuY291c2luZWF1IiwiYSI6ImNpc2h1OHN2bjAwNzMyeG1za3U0anczcTgifQ.KCp_hDxNidB1n29_yBPXdg',
      mapd:{
        // port:9092,
        // dbName:'mapd',
        // user:'publicuser',
        // password:'XXXXXXXX',
        dbName:'meit',
        user:'publicuser',
        password:'password'
      }
    },
    debug:true,
    loaded:false,
    language:'en',
    keywords:'en',
    emission: 'nox',
    mapLayer:'mapmeit',
    mapDLayer:'mapmeit',
    table:'DB_2020',
    tables:[{id:'DB_2015'},{id:'DB_2016'},{id:'DB_2017'},{id:'DB_2018'},{id:'DB_2019'},{id:'DB_2020',checked:true},{id:'DB_2021'},{id:'DB_2022'},{id:'DB_2023'}],
    stables:['DB_2015','DB_2016','DB_2017','DB_2018','DB_2019','DB_2020','DB_2021','DB_2022','DB_2023'],
    divider: 1000000,
    keyTags:'',
    panels:'',
    charts:'',
    emissions:'',
    // semissions:[],
    avgemissions:['inst_ph','ntu'],
    unitGroup:'weight',
    unit:'t',
    units:{},
    years:'',
    year:'2015',
    container:"#home",
  },

  get KEYS(){return this.options.KEYS;},
  set KEYS(value){this.options.KEYS=value;},
  get loaded(){return this.options.loaded;},
  set loaded(value){this.options.loaded=value;},
  get container(){return this.options.container;},
  get table(){return this.options.table;},
  // set table(value){this.options.table=value;if(this.loaded)this.mapd.createCrossFilter();},
  
  get washemissions(){
    return this.options.emissions.filter(e=>e.type=="wash")
  },
  set table(value){
    if(!this.options.stables.includes(value)&&!this.washemissions.includes(this.emission))this.emission='nox';
    this.options.table=value;
    if(this.loaded)this.mapd.createCrossFilter();
    this.ExportC.clear();
  },
  get tables(){return this.options.tables;},
  set tables(value){
    this.options.tables=value;
    
  },

  get language(){return this.options.language;},
  set language(value){this.options.language=value;},
  get keywords(){return this.options.keywords;},
  get emissions(){
   
    return this.options.stables.includes(this.table)?this.options.emissions:this.options.emissions.filter(e=>e.type!="wash");
  },
  get mapLayer(){return this.options.mapLayer;},
  set mapLayer(value){this.options.mapLayer=value;this.setmapDLayer();},
  get mapDLayer(){return this.options.mapDLayer;},
  
 
  setmapDLayer:function(){
    const mapLayer=this.mapLayer;
    const zoom = this.mapContainer.zoom;
    if(mapLayer==='mapmeit'||mapLayer==='prov'){this.options.mapDLayer=mapLayer;return;}
    const oldMapDLayer = this.options.mapDLayer;
    for(let key in this.geomaps){
        let layer = this.geomaps[key];
        if(zoom >=layer.minimum && zoom<=layer.maximum)this.options.mapDLayer=key;
    }
    return !(oldMapDLayer==this.options.mapDLayer);
  },
  
  get emission(){return this.options.emission;},
  set emission(value){
    this.options.emission=value;
    this.unitGroup=this.emissions.find(item=>item.id===value)['unit'];
    this.unit=this.units.find(item=>item.default)['id'];
    this.divider=this.units.find(item=>item.default)['divider'];
    
    
    this.mapd.changeGroup();
  },
  get unitdname(){return this.units.find(item=>item.id===this.unit).keyword;},
  set unit(value){
    this.options.unit=value;
    this.divider = this.units.find(item=>item.id===value).divider;
  },
  get divider(){return this.options.divider;},
  set divider(value){this.options.divider=value},
  
  get unitGroup(){return this.options.unitGroup},
  set unitGroup(value){this.options.unitGroup=value},
  get unit(){return this.options.unit;},
  get units(){
    
    return this.options.units[this.unitGroup];
    
  },
  get year(){return this.options.year;},
  set year(value){this.options.year=value;this.mapd.changeGroup();},
  
  // get AUTH0(){return this.options.AUTH0;},
  
  get years(){return this.options.years;},
  get keyTags(){return this.options.keyTags;},
  get panels(){return this.options.panels;},
  get geomaps(){return this.options.geomaps;},
  set geomaps(value){return this.options.geomaps=value;},
  get gis(){return this.options.gis;},
  get charts(){return this.options.charts;},
  set charts(value){this.options.charts=value;},
  
  get debug(){return this.options.debug;},
  refresh:function(){
    const self=this;
    if(this.mapd){
      
      self.mapd.reSizeAll()
      // debounce(function(){self.mapd.reSizeAll()}, 100)
    }
  },
  construct:function(){
    if(this.debug)console.log("Constructing App");
    this.show();
    
  },
  show:function(){
    this.render();
    // this.Socket = new Socket(this.pointer);
    this.loadApp();
    this.loadMapD();
  },
  loadApp:function(){
    this.header = new Header(this.pointer,{container:"#header"});
    // this.Upload = new Modal(this.pointer,{container:"body",name:'upload'});
  },
  
  loadMapD:function(){
    const self=this;
    this.Footer = new Footer(this.pointer,{container:".footer"})
    this.mapd = new MapD(this.pointer);
    this.ExportC = new ExportC(this.pointer,{container:"body"});
    this.changeLanguage(this.language) //TODO: initialize labels
    this.grid = new Grid(this.pointer);
    // this.mapd = new MapD(this.pointer);
    this.mapContainer = new MapContainer(this.pointer,{},function(){
      $('#bannerChevron').trigger("click");
      self.loaded=true;
      $('[data-toggle="tooltip"]').tooltip({ trigger: "hover",flip:false });
      $('.dropdown-toggle').dropdown({ flip:false })
      self.changeLabels();
      self.mapd.getMap();
    });
    
  },
  changeLanguage:function(lang) {
    if(this.debug)console.log('Change Language');
    this.language=lang;
    this.changeLabels();
    if(this.mapContainer)this.mapContainer.setLanguage(lang);
  },
  changeLanguageToggle:function() {
    if(this.debug)console.log('Change Language Toggle');
    this.language= (this.language==='en') ? 'fr':'en';
    this.changeLabels();
    if(this.mapContainer)this.mapContainer.setLanguage(this.language);
    this.refresh();
  },
  getKey:function(key){
    return this.keywords.find(function(keyword){return keyword.id===key;})[this.language];
  },
  changeLabels:function() {
    const self=this;
    // this.keyTags.forEach(function(keyTag){
    //   const key = this.keywords[keyTag.id];
    //   $(keyTag.tag).text(key[this.language]);
    // },this);
    // console.log()
    $("*[keyword]").each(function(){
      const keyword=$(this).attr("keyword");
      const keywordType=$(this).attr("keywordType");
      if(keywordType==='emission' ||keywordType==='unit')return $(this).text(self.keywords[self[keywordType]][self.language]);
      if(keywordType==='year')return $(this).text(self[keywordType]);
      if(!(self.keywords[keyword])){
        return;
        // return console.log("WARNING:keyword({0}) does not exist".format(keyword));
      }
      if(keywordType==="text")return $(this).text(self.keywords[keyword][self.language]);
      if(keywordType==="img")return $(this).attr("src",self.keywords[keyword][self.language]);
      if(keywordType==="placeholder")return $(this).attr("placeholder",self.keywords[keyword][self.language]);
      if(keywordType==="title"){return $(this).attr("data-original-title",self.keywords[keyword][self.language]).tooltip();}
    })
    
  },  
  render:function(){
    $(this.container).append(this.renderhtml);
  },
  get renderhtml(){
    return `
    <div id="header"></div>
    <div id="mapcontainer"><div id="map"></div></div>
    <div class="bodyContainer">
      <!--<div class="sidebar left"></div>-->
      <div class="footer"></div>
    </div>
    `;
  },
}







