var $ = require('jquery');
var _= require('underscore');
var c3 = require('c3');
var d3 = require('d3');

$.getJSON("data/public-data.js", function(data) {
  var auctions = _.sortBy(data.auctions, 'id');
  // init data
  var cols = [];
  var cols2 = [['bids_dates'], ['bids'], ['means_dates'],['means']];
  var x_cols3 = {};
  var cols3 = [];
  var cols4 = [];
  _.each(auctions, function(auction){
    // console.log(auction["bids"]);
    auction_bids = _.sortBy(auction.bids, 'created_at');
    var bid_amts = _.pluck(auction.bids, 'amount');
    bid_amts.sort(function(a, b){return b-a;});

    //Chart 2
    last_bid = _.last(bid_amts);
    if(last_bid){
      cols2[0].push(auction.end_datetime.substring(0,10));
      cols2[1].push(last_bid);
    }
    bid_amts.unshift(auction.id, auction.start_price);
    cols.push(bid_amts);

    // Chart 3 & 4
    x_name= 'sec_'+auction.id;
    y_name = 'bid_'+auction.id;
    var x_arr = [x_name, 0];
    var y_arr = [y_name, 3500];

     _.each(auction_bids, function(bid){
       bid.time_from_start = timeDiff(auction.start_datetime, bid.created_at);
       x_arr.push(bid.time_from_start);
       y_arr.push(bid.amount);
     });
      if (x_arr.length > 3) { // Exclude auctions without bids
        x_cols3[y_name] = x_name;
        cols3.push(x_arr, y_arr);

        //Chart 4
        x4_arr = x_arr.slice(0,1);
        var norm_scale = d3.scale.linear().domain([0, _.max(x_arr.slice(1))]);
        norm_x = _.map(x_arr.slice(1), function(x) {return norm_scale(x);});
        x4_arr = x4_arr.concat(norm_x);
        cols4.push(x4_arr, y_arr);
      }

   });

   //Chart 2 - Calc mean  by date
   var meanDates = {};
   for(x=1;x < cols2[0].length; x++){
     if(meanDates[cols2[0][x]]){
       meanDates[cols2[0][x]].push(cols2[1][x]);
     } else {
       meanDates[cols2[0][x]] = [cols2[1][x]];
     }

   }
   _.each(meanDates, function(v,k){
     cols2[2].push(k);
     var avg = (_.reduce(v, function(memo, num){ return memo + num; }, 0))/k.length;
     cols2[3].push(avg);

   });
   // Chart 1
    var chart = c3.generate({bindto: '#chart',
    data: {
      columns: cols},
  axis:{
    x: {
      label: {
        text: 'bid number',
        position: 'outer-middle'
      },
      tick: {
        fit: true}
    },
    y: {
      label: {
        text: 'bid amount',
        position: 'outer-middle'
      }
    }
  }});

// Chart 2
$(document).ready(function(){
  $('#switcher').click(function (e) {
      e.preventDefault();
      $("#chart3_wrap").toggle();
      $("#chart4_wrap").toggle();
  });
});
var chart2 = c3.generate({bindto: '#chart2',
data: {
  xs: {
    bids: 'bids_dates',
    means: 'means_dates'
  },
  columns: cols2,
  types: {
    bids: 'scatter'
  },
  names: {
    bids: 'Bids',
    means: 'Mean Bid By Date'
  }
},
  axis: {
      x: {
          type: 'timeseries',
          tick: {
              format: '%Y-%m-%d',
              fit: true
          }
      },
      y: {
            label: {
              text: 'bid amount',
              position: 'outer-middle'
            }
          }
  }
});

// Chart 3
// for every bid/ in auction/ normatize
var chart3 = c3.generate({
    data: {
       columns: cols3,
       xs: x_cols3

    },
    axis: {x : {tick : {fit: true, count: 10, format: function(x){return Math.floor(x/3600);},
                label: {text: 'Hours after start'}
                }
          }
    },
    bindto: "#chart3"
});

var chart4 = c3.generate({
    data: {
       columns: cols4,
       xs: x_cols3

    },
    axis: { x : {
        tick : { fit : true, culling:{max:4}, format: function(x){return Math.floor(x*100)+"%";},
                label: {text: 'Hours after start'}
                }
          }
    },
    bindto: "#chart4"
});

});

var timeDiff = function(startTime, endTime){
  var t1 = Date.parse(startTime);
  var t2 = Date.parse(endTime);
  var dif = t2-t1;
  return dif/1000;
};
