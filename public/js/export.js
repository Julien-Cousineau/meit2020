/*global saveAs Blob,XLSX,g_emissionOutputs*/
function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

function s2ab(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
}

/*global extend,dc */

function ExportC(parent,options){
  this._parent = parent;
  this.options = extend(Object.create(this.options), options);
  this.construct();
}

ExportC.prototype = {
  options:{container:"body",
  progressbarid:"exportprogressbar",
  },
  get parent(){if(!(this._parent))throw Error("Parent is undefined");return this._parent();},
  get container(){return this.options.container;},
  get progressbarid(){return this.options.progressbarid;},
  get emission(){return this.parent.emission;},
  get unit(){return this.parent.unit},
  get filters(){return this.parent.mapd.filters},
  get units(){return this.parent.units},
  construct:function(){
    
    this.render();
  },
  render:function(){
    $(this.container).append(this.renderhtml);
    // $('body').append(this.defaultdropzone());
    // this.setDropzone();
    this.constructFunc();
  },
  clear:function(){
     $('#exportModal').remove();
    this.render();
  },
  constructFunc:function(){
    const self=this;
    const keywords = this.parent.keywords;
    const language = this.parent.language;
    $('#exportModal').on('show.bs.modal', function (e) {
      // const userinfo =self.parent.userInfo;
      // const user=userinfo.user_metadata.first;
      const date = new Date();
      const filename ="{0}{1}{2}{3}{4}{5}".format(
        date.getFullYear(),(date.getMonth()+1).pad(2),date.getDate().pad(2),
        date.getHours().pad(2),date.getMinutes().pad(2),date.getSeconds().pad(2));
      const datestr = "{0}-{1}-{2} {3}:{4}:{5}".format(
        date.getFullYear(),(date.getMonth()+1).pad(2),date.getDate().pad(2),
        date.getHours().pad(2),date.getMinutes().pad(2),date.getSeconds().pad(2));
        
      // console.log(filename)
      $('#exportuser').val(keywords['exportname'][language]);
      $('#exportdate').val(datestr);
      $('#exportdatabase').val(self.parent.table);
      $('#exportyear').val(self.parent.year);
      // $('#exportunit').val(self.parent.unit);
      $('#exportfilename').val(filename);
    });
    
    $('.card-body li').on( 'click', function( e ) {
      const $target = $( e.currentTarget ),
            switchid = $target.attr( 'switchid' ),
            $inp = $target.find( 'input' );
      $inp.prop("checked", !$inp.prop("checked"));
    });
    $('#modelexportbtn').on('click',function(e){
      self.export();
    });
  },
  get renderhtml(){
    const self=this;
    const bodyemissions = `<ul class="list-group">{0}</ul>`.format(this.parent.emissions.map(item=>{item.htmltype='htmlswitch';return item;})
                      .map(item=>self[item.htmltype](item)).join(""));
    
    
    this.summary =[
      {keyword:"username",id:"user",value:"username",htmltype:'htmlfixlabel'},
      {keyword:"date",id:"date",value:"2018-01-01",htmltype:'htmlfixlabel'},
      {keyword:"database",id:"database",value:"Table1",htmltype:'htmlfixlabel'},
      // {keyword:"unit",id:"unit",value:"xxx",htmltype:'htmlfixlabel'},
      // {keyword:"forecastyear",id:"year",value:"2015",htmltype:'htmlfixlabel'},
      {keyword:"comments",id:"comments",value:"",htmltype:'htmlinputtext'},
      {keyword:"filename",id:"filename",value:"meit",htmltype:'htmlinputtext'},
      ];
    const bodygeneral=this.summary.map(item=>self[item.htmltype](item)).join(""); 
    
    const bodysheets = `<ul class="list-group">{0}</ul>`.format(this.parent.charts.map(item=>{
                      if(item.id==="paneltrend")item.htmltype='htmlnull';
                      else item.htmltype='htmlswitch';
                      return item;
      
    })
                      .map(item=>self[item.htmltype](item)).join(""));
    
    // const bodysheets = [
    //   {label:"User",name:"user",value:"username",type:'fixLabel'},
      
    //   ];
    
    const cards=[
      {col:"col-sm-12 col-md-5",key:'',header:"general",body:bodygeneral},
      {col:"col-sm-12 col-md-4",key:'charts',header:"sheets",body:bodysheets},
      {col:"col-sm-12 col-md-3",key:'emissions',header:"emissions",body:bodyemissions},
    ].map(card=>self.card(card)).join("");
    const progressbar=this.htmlprogressbar({id:this.progressbarid});
    return`
      <div class="modal fade" id="exportModal" tabindex="-1" role="dialog" aria-labelledby="exportModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exportModalLabel" keyword="export" keywordType="text">Export</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  {0}
              	</div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="container">
              <div class="row">
                <div class="col-sm-9">
                  {1}
                </div>
                <div class="col-sm-3">
                  <button id='modelexportbtn'type="button" class="btn btn-primary float-right" keyword="export" keywordType="text">Export</button>
                  <button type="button" class="btn btn-secondary float-right" data-dismiss="modal" keyword="closee" keywordType="text">Close</button>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `.format(cards,progressbar);
  },
  card:function(obj){
    return `
      <div class="{0}">            
        <div class="card" key="{1}">
          <h5 class="card-header" keyword="{2}" keywordType="text">{2}</h5>
          <div class="card-body">
            {3}
          </div>
        </div>
      </div>
    `.format(obj.col,obj.key,obj.header,obj.body);
  },
  htmlfixlabel:function(obj){
    return `
      <div class="row">
        <label for="export{1}" class="col-sm-4 col-form-label" keyword="{0}" keywordType="text">{0}</label>
        <div class="col-sm-8">
          <input type="text" readonly="" class="form-control-plaintext form-control-sm" id="export{1}" value="{2}">
        </div>
      </div>
    `.format(obj.keyword,obj.id,obj.value);
  },
  htmlinputtext:function(obj){
    return `
      <div class="row">
        <label for="export{1}" class="col-sm-4 col-form-label" keyword="{0}" keywordType="text">{0}</label>
        <div class="col-sm-8">
          <input class="form-control form-control-sm" type="text" id="export{1}" placeholder="{2}">
        </div>
      </div>
    `.format(obj.keyword,obj.id,obj.value);
  },  
  htmlswitch:function(obj){
    return `
    <li class="list-group-item" switchid="export_{1}">
      <span keyword="{0}" keywordType="text">{0}</span>
      <div class="material-switch pull-right">
          <input id="switch_{1}" type="checkbox" key="{1}" {2}/>
          <label for="switch_{1}" class="switch-color"></label>
      </div>
    </li>
    `.format(obj.keyword,obj.id,obj.checked?'':'');
  },
  htmlnull:(obj)=>{
    return `<input id="switch_{1}" type="hidden" key="{1}" {2}/>`.format(obj.keyword,obj.id,obj.checked?'':'');
  },
  htmlprogressbar:function(obj){
    return `
      <div class="progress bar">
        <div class="progress-bar progress-bar-success {0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">
          
        </div>
        <div class="h6 {0}text" style="position: absolute;right: 0;left: 0;text-align: center;"> 0% </div>
      </div>
      `.format(obj.id);
  },
  export:function(){
    const self=this;
    const wb = this.wb = new Workbook();
    
    
    const selectedemissions={}; 
    const selectedcharts ={};
    $(".card[key='emissions'] input").each(function(){return selectedemissions[$(this).attr('key')]={checked:$(this).prop("checked")}});
    $(".card[key='charts'] input").each(function(){return selectedcharts[$(this).attr('key')]={checked:$(this).prop("checked")}});
    
    this.getSummarySheet();
    this.getEmissionSheets({selectedcharts:selectedcharts,selectedemissions:selectedemissions},function(){
      
      const filename = $('#export{0}'.format('filename')).val() + ".xlsx";
      let wbout = XLSX.write(self.wb, {bookType:'xlsx', bookSST:false, type: 'binary'});
      // let wbout = XLSX.writeFileSync(wb,filename);
      saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), filename);
    });
    
  },
  getSummarySheet:function(){
    const keywords = this.parent.keywords;
    const language = this.parent.language;
   
    let table = [];
    
    this.summary.forEach(item=>{
      table.push([keywords[item.keyword][language],$('#export{0}'.format(item.id)).val()]);
    });
  
    // table.push(["Units",this.unit]);
    table.push([""]);
    table.push([keywords['filters'][language]]);
    
    const charts = this.parent.charts;
    
    charts.forEach(chart=>{
      const keyword = chart.keyword;
      const name = this.parent.keywords[keyword][language];
      const filters = chart.dc.dc.filters();
      if(!(filters.length)){table.push([name,keywords['none'][language]])}
      else{
        table.push([name].concat(filters));
      }
      
    });
    const sheetname = keywords['general'][language];
    const ws= XLSX.utils.aoa_to_sheet(table);
    XLSX.utils.book_append_sheet(this.wb, ws, sheetname);
    
    
  },
  updateProgressBar:function(_value){
    const value = parseInt(_value)
    $('.{0}'.format(this.progressbarid)).css('width', value+'%').attr('aria-valuenow', value);
    $('.{0}text'.format(this.progressbarid)).text(value +"%");
  },
  getEmissionSheets:function(obj,callback){
    const self=this;
    
    const wb = this.wb;
    
    const charts = this.parent.charts.reduce((final,chart)=>{if(obj.selectedcharts[chart.id].checked)final.push(chart);return final;},[]);
    const emissions = this.parent.emissions.reduce((final,emission)=>{if(obj.selectedemissions[emission.id].checked)final.push(emission);return final},[]);
    const keywords = this.parent.keywords;
    const language = this.parent.language;
    let header = [''].concat(emissions.map(function(emission){return emission.id;}));
    const _units=this.parent.options.units;
    const units=emissions.map(emission=>_units[emission.unit].find(u=>u.default))
    const unitsHeader=[''].concat(units.map(u=>u.id))
    
    this.parent.mapd.export({charts:charts,emissions:emissions},function(err,obj){
      if(obj.meta==='process')return self.updateProgressBar(obj.data); 
      const data=obj.data;
      
      charts.forEach((chart,i)=>{
        
        const cdata=data[i];
        const keys=cdata[0].map(item=>item.key0);
        
        let table=[];
        table.push(header);
        table.push(unitsHeader)
       
        
        
        for(let ikey=0,nrow=keys.length;ikey<nrow;ikey++){
          const key=keys[ikey];
          
          
          let row=[];
          for(let ie=0,ne=emissions.length;ie<ne;ie++){
            const e_name = emissions[ie].id;
            const divider=units[ie].divider
            const index = cdata[ie].findIndex(item=>item.key0===key); 
            let value = Number.parseFloat(cdata[ie][index][e_name]/divider).toPrecision(7);
            row.push(value);
          }
          const keyname = (chart.dim==='meit')?key+1:key;// Hack: for some reason, key0 is meit-1 (changed by map)
          table.push([keyname].concat(row));
        }
        
        let sheetname = keywords['a_'+chart.keyword][language];
        const ws= XLSX.utils.aoa_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, ws, '_'+sheetname);
      });
      callback();
    });
  },
  

};
