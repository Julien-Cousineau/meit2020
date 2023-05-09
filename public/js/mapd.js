/*global $,extend,localStorage,formatTotal*/

function MapD(parent){
  this._parent = parent;
  const self = this;
  this.pointer = function(){return self;};
  this.cache={mapmeit:{},'hex16':{},'hex4':{},'hex1':{},prov:{}},
  this.bounds=[-100,50,-40,60];
  // this.first = true;
  this.createQueue();
  this.createCrossFilter();
  this.pillcontainer=[];
  this.badges={};
  this.workerSetup();
  
  // this.queueSetup();
  
  // this.getMapSetup();
}
MapD.prototype = {
  options:{
    priorityindex:0,
  },
  get priorityindex(){return this.options.priorityindex;},
  set priorityindex(value){this.options.priorityindex=value;},
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get keywords(){return this.parent.keywords;},
  get language(){return this.parent.language;},
  get IP(){return this.parent.options.IP},
  get emission(){return this.parent.emission;},
  get year(){return this.parent.year;},
  get divider(){return this.parent.divider;},
  get reduceFunc(){return this.reduceFunction();},
  get reduceTrendFunc(){return this.reduceTrendFunction();},
  get mapDLayer(){return this.parent.mapDLayer;},
  get geomaps(){return this.parent.geomaps},
  get mapContainer(){return this.parent.mapContainer},
  get filters(){return this.crossFilter.getFilter()},
  get table(){return this.parent.table;},
  get KEYS(){return this.parent.KEYS;},

  createCrossFilter:function(){
    const self=this;
    const table=this.table;
    const keys = this.KEYS.mapd;
    console.log(this.IP);
    const connector = new DbCon();
    connector.protocol("https")    
    .host(this.IP)
    .port("/api")
    // .port(9092)
    // .host(this.IP)
    // .port(keys.port)
    .dbName(keys.dbName)
    .user(keys.user)
    .password(keys.password)
    .connect(function(error, con) {
       self.con=con;
       
       crossfilter.crossfilter(con, table).then(function(crossFilter){return self.crossFilterSetup(crossFilter);})
    });
    var port = connector.port();
    console.log("port",port);
  },

  crossFilterSetup:function(crossFilter){
    this.crossFilter = crossFilter;
    dc.chartRegistry.clear();
    this.createCharts();
  },
  _reduceFunc:function(emission,year,avgemissions=[],trend=false){
    let exp='';
    if(emission=='co2e'){
      const factor = 'other' + year;
      exp = (year==='2015')?
                    "25*ch4 + 298*n2o + co2":
                    "(25*ch4 + 298*n2o + co2)*{0}*0.015625".format(factor);
    } else {
      const stre=(emission==='nox')?'nox':'other';
      const factor = stre + year;
      const fuelFactor = (emission=='fuel_cons')?1000000:1;
      exp = (year==='2015')?
                    "{0}*{1}".format(emission,fuelFactor):
                    "{0}*{1}*{2}*0.015625".format(emission,fuelFactor,factor);
    }
    const agg_mode=avgemissions.includes(emission)?"avg":"sum";
    const obj={expression: exp,agg_mode:agg_mode,name: emission};
    if(trend)obj['name']='year'+year;
    return obj;
  },
  reduceFunction:function(){
    return [this._reduceFunc(this.emission,this.year,this.parent.options.avgemissions)];
  },
  reduceTrendFunction:function(){
    return this.parent.options.years.map(item=>{
      const year=item.id;
      return this._reduceFunc(this.emission,year,this.parent.options.avgemissions,true);
    },this);
  },
  reduceUnique:function(){
    return [{expression: "APPROX_COUNT_DISTINCT(trip_id,1)",agg_mode:"CUSTOM",name: this.emission}]
  },
  colorScheme:["#22A7F0", "#3ad6cd", "#d4e666"],
  createCharts:function(){
    const self=this;
    // const crossFilter = this.crossFilter;
    // console.log(crossFilter)
    // let allColumns = crossFilter.getColumns();
    const charts=this.parent.charts;
    
    let array=[];
    for(let i in charts){
      array.push(i);
    }
    
    const createChartFunc = function(i,callback){
      let chart=charts[i];
      chart.dc = new Chart(self.pointer,chart,function(){
        // console.log("done chart")
        callback();
      });  
    }
    async.each(array, createChartFunc,function(err){
      if( err ) {console.log('A file failed to process');}
      self.createMapDim();
      self.createNumberDisplay();
      self.render();
      self.resizeFunc();
      // self.first = false;
    });

  },
  createMapDim:function(){
    const geomaps=this.geomaps;
    for(let key in geomaps){
      const geomap = geomaps[key];
      geomap.dc=new GeoMap(this.pointer,geomap)
    };
  },
  createNumberDisplay:function(){
    this.total = this.crossFilter.groupAll().reduceMulti(this.reduceFunc);
    this.unique = this.crossFilter.groupAll().reduce(this.reduceUnique());
  },
  changeGroup:function(){
    const charts=this.parent.charts;
    const geomaps=this.geomaps;
    this.crossFilter.removeGlobalFilters()
    
    if(this.parent.emission=="inst_ph"){
      const a=this.crossFilter.filter(true)
      a.filter("inst_ph > 0")
    }
    else if(this.parent.emission=="ntu") {
      const a=this.crossFilter.filter(true)
      a.filter("ntu > 0")
    }

    for(let key in charts){
      let chart=charts[key];
      chart.dc.changeGroup();
    }
    for(let key in geomaps){
      const geomap = geomaps[key];
      geomap.dc.changeGroup();
    };
    this.total.reduceMulti(this.reduceFunc);
    this.unique.reduce(this.reduceUnique());
  },
  removeBadge:function(id,filter){
    const badge = this.badges[id][filter];
    badge.dom.remove();
    delete this.badges[id][filter];
  },
  createBadge:function(obj){
    const {id,acc,chart,filter,label}=obj;
    
    const element = d3.select($('.pillcontainer')[0]);
    // const badge_id = '{0}_{1}'.format(id,filter.toString());
    
    if(typeof this.badges[id]==='undefined')this.badges[id]={};
    
    if(typeof filter==='undefined' || filter===null){
      for(let filter in this.badges[id]){
        this.removeBadge(id,filter);  
      }
    } else if(this.badges[id][filter]){
      this.removeBadge(id,filter);
    } else {
      const badge = this.badges[id][filter] = {filter:filter};
      const span =badge.dom= element.append('span').attr("class","badge badge-pill badge-filter")
        .attr("_panel",id)
        .attr("_filter",filter.toString())
        .on('click',()=>{
          if(chart){chart.filter(filter)}
          else {this.filterbyObj(obj)}
          this.draw();
          })
        span.append('i')
        .attr("keyword",acc)
        .attr("keywordType", "text")
        .text(this.keywords[acc][this.language]);
        const t =span.append('i');
        console.log("acc" + acc)
        let _filter = filter; 
        if(acc=="a_prov"){
          _filter=referenceProv[this.language][filter]
        } else {
          if(this.language=='fr')_filter=this.keywords['vlabels'][filter]
        }
        
        
        
        if(label)t.text(':' + label);
        if(!label)t.text(':' + _filter);
        span.append('i').attr('class','fa fa-times');
    }
    
    let count=0;
    for(let key in this.badges){
      const badge = this.badges[key];
      count +=Object.keys(badge).length;
    
    }
    (count==0)?$('.filterinside').removeClass("active"):$('.filterinside').addClass("active");
  },
  filterbyObj:function(obj){ //value=array
    const {id,filter,acc,label} = obj;
    
    if(id=="mapmeit"){
      const meitchart = this.parent.charts.find(item=>item.id=="panelmeit");
      meitchart.dc.dc.filter(filter?filter:[]);
      
    } else {
      
      
      this.createBadge(obj);
      if(Object.keys(this.badges[id]).length !== 0){
        const filters = Object.keys(this.badges[id]).map(key=>this.badges[id][key].filter);
        this.geomaps[id].dc.dimension.filterMulti(filters);
      }
      else{
        this.geomaps[id].dc.dimension.filterAll()
      }
      
    }
  },
  filterMap:function(bounds){
    // const bounds = this.mapContainer.bounds;
    const minx=bounds[0],miny=bounds[1],maxx=bounds[2],maxy=bounds[3];
    
    (minx===maxx) ? 
      this.geomaps['lng'].dc.dimension.filterAll():
      this.geomaps['lng'].dc.dimension.filter(dc.filters.RangedFilter(minx,maxx));;
    
    (miny===maxy) ?
      this.geomaps['lat'].dc.dimension.filterAll():
      this.geomaps['lat'].dc.dimension.filter(dc.filters.RangedFilter(miny,maxy));


    this.draw();
  },

  
  resizeFunc:function(){
    const self=this;
    window.addEventListener("resize", debounce(function(){self.reSizeAll()}, 100));
  },
  reSizeAll:function(){
    const charts=this.parent.charts;
    for(let i in charts){
      let chart=charts[i];
      const width = $('div[panelid="{0}"] .x_content'.format(chart.id)).width();
      const height = $('div[panelid="{0}"] .x_content'.format(chart.id)).height();
      $('.forchart').css("width", width );
      $('.forchart').css("height", height );
      chart.dc.dc.height(height)
                 .width(width);
    }
    this.draw();
  },
  draw:function(){
    const self=this;
    dc.redrawAllAsync();
    this.fixWidth();
    // debounce(function(){self.getTotalMap()}, 100)
    this.getTotalMap();
  },
  render:function(){
    const self=this;
    dc.renderAllAsync()
    this.fixWidth();
    // debounce(function(){self.getTotalMap()}, 100)
    this.getTotalMap();
  },
  fixWidth(){
    $('.forchart').width('auto')
  },
  workerSetup:function(){
    const self=this;
    const worker = this.worker = new Worker("js/myworker.js");

    worker.onmessage = function(event) {
      switch (event.data.type) {case "end": return self.postupdateData(event.data.data);}
    };
  },
  updateData:function(data){
    this.worker.postMessage({
      data: data,
      emission: this.emission
    });
  },
  postupdateData:function(data){
    // console.log(data)
    this.cache[this.mapDLayer] = data.cache;
    this.mapContainer.updateHexPaint(data.stops,data.minmax,data.colors);
  },
  getTotalMap:function(){
    const {emission,divider,language}=this;
    this.total.valuesAsync().then(data=>$('#totalnumber').text(formatTotal(data[emission]/divider,language)));
    this.unique.valuesAsync().then(data=>$('#uniquetrip').text(formatTotal(data[emission],language)));
    this.getMap();
  },  
  getMap:function(panning){
    if(panning && this.mapDLayer!=='hex16' && this.mapDLayer!=='hex4' && this.mapDLayer!=='hex1')return;
    
    let bounds=null;
    if(this.mapDLayer==='hex16' || this.mapDLayer==='hex4' || this.mapDLayer==='hex1')bounds=this.mapContainer.bounds;
    // $('#map').addClass("chart-loading-overlay");
    // $('#map').append(`<div class="loading-widget-dc"><div class="main-loading-icon"></div></div>`);
    this.queue.unshift({priorityindex:++this.priorityindex,bounds:bounds});

  },
  createQueue:function(){
    const self=this;
    this.queue = async.queue(function(obj, callback) {
      // console.log(obj.priorityindex,self.priorityindex)
      if(obj.priorityindex!==self.priorityindex)return callback();
      self.queueFunc(obj.bounds,function(data){
        // console.log("updateData")
        self.updateData(data);
        $('#map').removeClass("chart-loading-overlay");
        $('.loading-widget-dc').remove();
        callback();
      });
    }, 1);
  },
  queueFunc:function(bounds,callback){
    const self=this;
    
    let querystring = self.geomaps[self.mapDLayer].dc.group.writeTopQuery(50);
    querystring=querystring.replace('ip = false','NOT ip').replace('ip = true','ip');
    // console.log(querystring)
    if(bounds){
      const {expression}=this.reduceFunction()[0];
      const dim = this.geomaps[self.mapDLayer].dim;
      const table = this.parent.table;
      const limit = 1000000;
      
      const filters = this.crossFilter.getFilterString();
      console.log("TAble",table)
      const filtersstr = (filters)?"{0} AND ".format(filters):"";
      const con = "(lng>{0} AND lat>{1} AND lng<{2} AND lat<{3}) AND ".format(bounds[0],bounds[1],bounds[2],bounds[3]);
      // querystring = "SELECT {0} as key0,SUM({1}) AS {1} FROM {2} WHERE {4}{5}{1} IS NOT NULL GROUP BY key0 ORDER BY {1} DESC LIMIT {3}"
      querystring = "SELECT {0} as key0,SUM({1}) AS {2} FROM {3} WHERE {5}{6}{1} IS NOT NULL GROUP BY key0 ORDER BY {2} DESC LIMIT {4}"
                            .format(dim,expression,this.emission,table,limit,con,filtersstr);
      querystring=querystring.replace('ip = false','NOT ip').replace('ip = true','ip');
    }
    this.con.query(querystring, {}, function(err, data) {
      if(err)console.log(err);
      callback(data);
    });
    
  },


  export:function(obj,maincallback){
    const self=this;
    const filters = this.crossFilter.getFilterString();
    // const charts = this.parent.charts.reduce((final,chart)=>{if(obj.selectedcharts[chart.id].checked)final.push(chart);return final;},[]);
    // const emissions = this.parent.emissions.reduce((final,emission)=>{if(obj.selectedemissions[emission.id].checked)final.push(emission);return final},[]);
    const charts = obj.charts;
    const emissions = obj.emissions;
    const nqueries = parseFloat(charts.length *emissions.length);
    let iquery=0;
    const emissionOri = JSON.parse(JSON.stringify(this.parent.emission));
    const dimFunc = function(chart,callback){
      
      
      // console.log(chart.dc.group)
      const emissionFunc=function(emission,_callback){
        self.parent.emission = emission.id;
        let strquery = chart.dc.group.writeTopQuery(100);
        // console.log(filters);
        if(filters)strquery=strquery.split('WHERE')[0]+"WHERE " + filters + "GROUP BY" +strquery.split('GROUP BY')[1]
        // console.log(strquery);
        self.con.query(strquery, {}, function(err, data) {
          maincallback(err,{meta:'process',data:++iquery/parseFloat(nqueries)*100})
          _callback(null,data);
        });
      };
      async.mapSeries(emissions,emissionFunc,callback);
    };
    async.mapSeries(charts,dimFunc,function(err,data){
      maincallback(err,{meta:'done',data:data})
      self.parent.emission = emissionOri;
    })
  }
};