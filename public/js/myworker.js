importScripts("./ext/d3-array.v1.min.js");
importScripts("./ext/d3-collection.v1.min.js");
importScripts("./ext/d3-color.v1.min.js");
importScripts("./ext/d3-format.v1.min.js");
importScripts("./ext/d3-interpolate.v1.min.js");
importScripts("./ext/d3-scale.v1.min.js");



onmessage = (obj) => {
  const cache={};
  const {data,emission}=obj.data;
  // const data=obj.data.data;
  // const emission=obj.data.emission;
  let stops=[];


  // const xscale= d3.scaleLinear()
  //           .domain([1E6,1E7,1E8,1E9,1E10,1E11,1E12,1E13])
  //           .range(['#3288bd','#66c2a5','#abdda4','#e6f598','#fee08b','#fdae61','#f46d43','#d53e4f']);
  
  let min=1.0E10;
  let max=0.0;
  for(let i=0,n=data.length;i<n;i++){
    min = Math.min(data[i][emission],min)
    max = Math.max(data[i][emission],max)
  }
  const array = [0,1,2,3,4,5,6,7].map(v=>(max-min)*(v/7)+min);
      
  
  const xscale= d3.scaleLinear()
            .domain(array)
            .range(['#3288bd','#66c2a5','#abdda4','#e6f598','#fee08b','#fdae61','#f46d43','#d53e4f']);

  for(let i=0,n=data.length;i<n;i++){
    const item=data[i];
    cache[item.key0]={};
    cache[item.key0].value=item[emission];  
    cache[item.key0].color=xscale(item[emission]);
    stops.push([parseInt(item.key0),cache[item.key0].color]);
  }
  postMessage({type:"end",data:{cache:cache,stops:stops,minmax:[min,max],colors:['#3288bd','#d53e4f']}});
}
