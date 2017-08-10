import { Meteor } from 'meteor/meteor';
var fs = Npm.require('fs');
var Fiber = Npm.require('fibers');
var ds18b20 = require('ds18b20');

const rpGPIO = 3;
const bpGPIO = 5;
const plGPIO = 7;
const awGPIO = 11;

const onGPIO = 0;
const offGPIO = 1;

_probeTemp=999;


Accounts.config({
    forbidClientAccountCreation: true
});

Meteor.startup(function ()  {

    //
    // Allows pool picture to render when updated without refreshing page
    //
    var fileName = '/var/www/meteor/poolPic.jpg';

    fs.watchFile(fileName, (curr, prev) => {
      curr.name = fileName;
      new Fiber(() => {
        Image.upsert({name: fileName}, curr);
      }).run();
    });

    // code to run on server at startup

    if (RasPool.find().count() === 0) {
         RasPool.insert({ 
              Component: 'RecircPump',
              Status: 'OFF',  
              StartTime: '09:00',  
              StopTime: '21:00'
    });

    RasPool.insert({ 
         Component: 'BoosterPump',
         Status: 'OFF',
         RunTime: 2,  
         EndTime: new Date(),
         TimeRemaining: 120 
    });

    RasPool.insert({ 
        Component: 'PoolLight',
        Status: 'OFF',  
    });

    RasPool.insert({ 
        Component: 'WaterValve',
        Status: 'SHUT',
        InchesToAdd: 1,  
        EndTime: new Date(),
        TimeRemaining: 60 
    });

    RasPool.insert({ 
        Component: 'SaltCell',
        Status: 'OFF',  
        EndTime: new Date(),
        TimeRemaining: 24,
        PercentOutput: 0 
    });

    RasPool.insert({ 
        Component: 'systemTime',
        currentTime: new Date(),
        currentTemp: 75,
        waterTemp: 75  
    });
  }



  Meteor.methods({
    writeGPIO: function (channel, state) {
      var PythonShell = require('python-shell');

      var options = {
        scriptPath: '/var/www/meteor/rasPool2/server/',
        args: [channel, state]
      }
      
      PythonShell.run('toggle.py', options, function (err) {
        if (err) throw err ;
      });
    },
    startRecircPump: function () {
      var RP = RasPool.find({Component: "RecircPump"}).fetch();
      var RPid = RP[0]._id;

      RasPool.update(
        {_id: RPid},
        {$set: {Status: "ON"}},
      );
      Meteor.call('writeGPIO', rpGPIO, onGPIO);
    },
    stopRecircPump: function() {
      var RP = RasPool.find({Component: "RecircPump"}).fetch();
      var RPid = RP[0]._id;

      RasPool.update(
        {_id: RPid},
        {$set: {Status: "OFF"}},
      );
      Meteor.call('writeGPIO', rpGPIO, offGPIO);
    },
    startBoosterPump: function(runTime) {
      var BP = RasPool.find({Component: "BoosterPump"}).fetch();
      var BPid = BP[0]._id;
      
      RasPool.update(
        {_id: BPid},
        {$set: {Status: "ON"}},
      );
      var d = new Date();
      var ms = (d.getTime() + runTime*60*60*1000);
      var et = new Date(ms);
      RasPool.update(
        {_id: BPid},
        {$set: {EndTime: et, RunTime: runTime}},
      );
      Meteor.call('writeGPIO', bpGPIO, onGPIO);
    },
    stopBoosterPump: function() {
      var BP = RasPool.find({Component: "BoosterPump"}).fetch();
      var BPid = BP[0]._id;
    
      RasPool.update(
        {_id: BPid},
        {$set: {Status: "OFF"}},
      );  
      Meteor.call('writeGPIO', bpGPIO, offGPIO);
    },
    turnPoolLightOn: function() {
      var PL = RasPool.find({Component: "PoolLight"}).fetch();
      var PLid = PL[0]._id;

      RasPool.update(
        {_id: PLid},
        {$set: {Status: "ON"}},
      );
      Meteor.call('writeGPIO', plGPIO, onGPIO);
    },
    turnPoolLightOff: function() {
      var PL = RasPool.find({Component: "PoolLight"}).fetch();
      var PLid = PL[0]._id;

      RasPool.update(
        {_id: PLid},
        {$set: {Status: "OFF"}},
      );
      Meteor.call('writeGPIO', plGPIO, offGPIO);
    },
    openWaterValve: function(runTime) {
      var AW = RasPool.find({Component: "WaterValve"}).fetch();
      var AWid = AW[0]._id;

      console.log(runTime);
      RasPool.update(
        {_id: AWid},
        {$set: {Status: "OPEN", InchesToAdd: runTime}},
      );
      var d = new Date();
      var ms = (d.getTime() + runTime*60*60*1000);
      var et = new Date(ms);
      RasPool.update(
        {_id: AWid},
        {$set: {EndTime: et}},
      ); 
      Meteor.call('writeGPIO', awGPIO, onGPIO);
    },
    shutWaterValve: function() {
      var AW = RasPool.find({Component: "WaterValve"}).fetch();
    var AWid = AW[0]._id;

    RasPool.update(
      {_id: AWid},
      {$set: {Status: "SHUT"}},
    ); 
    Meteor.call('writeGPIO', awGPIO, offGPIO);
    }
  });

//
// Ensure Data collection and GPIO pins are off/shut at startup
//
  Meteor.call('stopRecircPump');
  Meteor.call('stopBoosterPump');
  Meteor.call('turnPoolLightOff');
  Meteor.call('shutWaterValve');
  
//
// Forecast
//

  if (Forecast.find().count() === 0) {
       Forecast.insert({ 
            Day: 0,
            weekDay: 'Monday',
            date: '8 Aug',
            icon_url: 'http://icons.wxug.com/i/c/i/partlycloudy.gif',
            conditions: 'partly cloudy',
            hi_low: '75 / 65',
            pop: '20%',
            inch_precip: '0'
       });
       Forecast.insert({ 
            Day: 1,
            weekDay: 'Tuesday',
            date: '8 Aug',
            icon_url: 'http://icons.wxug.com/i/c/i/partlycloudy.gif',
            conditions: 'partly cloudy',
            hi_low: '75 / 65',
            pop: '20%',
            inch_precip: '0'
       });
       Forecast.insert({ 
            Day: 2,
            weekDay: 'Wednesday',
            date: '9 Aug',
            icon_url: 'http://icons.wxug.com/i/c/i/partlycloudy.gif',
            conditions: 'partly cloudy',
            hi_low: '75 / 65',
            pop: '20%',
            inch_precip: '0'
       });
       Forecast.insert({ 
            Day: 3,
            weekDay: 'Thursday',
            date: '10 Aug',
            icon_url: 'http://icons.wxug.com/i/c/i/partlycloudy.gif',
            conditions: 'partly cloudy',
            hi_low: '75 / 65',
            pop: '20%',
            inch_precip: '0'
       });
       Forecast.insert({ 
            Day: 4,
            weekDay: 'Friday',
            date: '11 Aug',
            icon_url: 'http://icons.wxug.com/i/c/i/partlycloudy.gif',
            conditions: 'partly cloudy',
            hi_low: '75 / 65',
            pop: '20%',
            inch_precip: '0'
       });
  }
  
});

function DateToMinutesPastMidnight(Date){
  var h = Date.getHours();
  var m = Date.getMinutes();
  var w = h*60 + m;

  return w;
}

function TimeToMinutesPastMidnight(Time) {
  var hoursDotMinutes = Time;
  var fieldArray = hoursDotMinutes.split(":");
  var minutes = Number(fieldArray[0])*60 + Number(fieldArray[1]);
  return minutes;
}

Meteor.setInterval(function(){
//
// Update system time variable in RasPool Collection
//

  var ST = RasPool.find({Component: "systemTime"}).fetch();
  var STid = ST[0]._id;
  var date = new Date();

  RasPool.update(
    {_id: STid},
    {$set: {currentTime: date}},
  );

//
// Update water temp variable in RasPool Collection
//

// Note: _probeTemp is a global variable.  Im sure there is a better way but that is the best way that I can get it to work for now.

  ds18b20.temperature('28-000008e0aa59', function(err, value) {
      if(err){
        console.log('ds18b20 Error');
      } else {
        _probeTemp = Math.round(value *9/5 +32);
      }
  });

  RasPool.update(
    {_id: STid},
    {$set: {waterTemp: _probeTemp}},
  );


//
// Check Recirc Pump Start/Stop times
//  

  var RP = RasPool.find({Component: "RecircPump"}).fetch();
  var RPid = RP[0]._id;
  var Current = DateToMinutesPastMidnight(new Date());
  var Start = TimeToMinutesPastMidnight(RP[0].StartTime);
  var Stop = TimeToMinutesPastMidnight(RP[0].StopTime);

  if (Current == Start) {
        RasPool.update(
          {_id: RPid},
          {$set: {Status: "ON"}},
        );
        Meteor.call('writeGPIO', rpGPIO, onGPIO);
  }

  if (Current == Stop) {
        RasPool.update(
          {_id: RPid},
          {$set: {Status: "OFF"}},
        );
        Meteor.call('writeGPIO', rpGPIO, offGPIO);
  }

//
// Check Booster Pump Stop times
//  

  var BP = RasPool.find({Component: "BoosterPump"}).fetch();
  var BPid = BP[0]._id;
  var End = BP[0].EndTime.getTime();
  var BPCurrent = new Date().getTime();
  var tr = Math.round((End - BPCurrent)/60000);
  var tr1 = BP[0].TimeRemaining;
  
  if (tr < 0) {
      tr = 0; 
  } else {
    RasPool.update(
          {_id: BPid},
          {$set: {TimeRemaining: tr}},
    );
  }

  if ((tr <= 0) && (BP[0].Status == "ON")) {
    RasPool.update(
      {_id: BPid},
      {$set: {Status: "OFF"}},
    );
    Meteor.call('writeGPIO', bpGPIO, offGPIO);
  }

//
// Check Water Valve Stop times
//  

  var AW = RasPool.find({Component: "WaterValve"}).fetch();
  var AWid = AW[0]._id;
  var AWCurrent = new Date().getTime();
  var End = AW[0].EndTime.getTime();
  var tr = Math.round((End - AWCurrent)/60000);

  if (tr < 0) {
        tr = 0; 
    } else {
      RasPool.update(
        {_id: AWid},
        {$set: {TimeRemaining: tr}},
      );
    }

    if ((tr <= 0) && (AW[0].Status == "OPEN")) {
      RasPool.update(
        {_id: AWid},
        {$set: {Status: "SHUT"}},
      );
      Meteor.call('writeGPIO', awGPIO, offGPIO);
    } 

//
// Check Water Valve Stop times
//  
    var SC = RasPool.find({Component: "SaltCell"}).fetch();
    var SCid = SC[0]._id;
    var et = SC[0].EndTime.getTime();
    var ct = new Date().getTime();

    var tr = Math.round((et - ct)/3600000);

    if (tr<0) {
      tr=0;
    } else {
      RasPool.update(
        {_id: SCid},
        {$set: {TimeRemaining: tr}},
      );    
    }

    if ((tr <= 0) && (SC[0].Status == "SuperChlorinate")) {
      RasPool.update(
        {_id: SCid},
        {$set: {Status: "AUTO"}},
      );
    }
   

}, '500');



Meteor.setInterval(function(){

  var ST = RasPool.find({Component: "systemTime"}).fetch();
  var STid = ST[0]._id;

//    
// Update current temp variable in RasPool Collection
//

  var openweatherAPI = Meteor.settings.openweathermap;
  var url = "http://api.openweathermap.org/data/2.5/weather?zip=23322,us&APPID=" + openweatherAPI + "&units=imperial";


//  this.unblock();
  Meteor.http.call("GET", url, function (error, result) {
    if (error) {
      console.log('Error');
    } else {
      RasPool.update({_id: STid},{$set: {currentTemp: Math.round(result.data.main.temp)}});
    }
  });



}, '5000');


Meteor.setInterval(function(){

  //
  // Weather API Request
  //

  var wunderAPI = Meteor.settings.wunderground;
  var url = "http://api.wunderground.com/api/" + wunderAPI + "/forecast10day/q/VA/Chesapeake.json";

  Meteor.http.call("GET", url, function (error, result) {
      if (error) {
        console.log('Error');
      } else {
        for (var i = 0, len = 5; i < len; i++) {
            var weekDay = result.data.forecast.simpleforecast.forecastday[i].date.weekday;
            var month = result.data.forecast.simpleforecast.forecastday[i].date.monthname_short;
            var day = result.data.forecast.simpleforecast.forecastday[i].date.day;
            var date = month + ' ' + day;
            var high = result.data.forecast.simpleforecast.forecastday[i].high.fahrenheit + '°';
            var low = result.data.forecast.simpleforecast.forecastday[i].low.fahrenheit + '°';
            var high_low = high + '/ ' + low;
            var pop = result.data.forecast.simpleforecast.forecastday[i].pop + '%';
            var conditions = result.data.forecast.simpleforecast.forecastday[i].conditions;
            if (conditions.includes("Chance of a")) {
                 conditions = conditions.substring(12);
            } else if (conditions.includes("Chance of")) {
                 conditions = conditions.substring(10);
            }
            var preURL = result.data.forecast.simpleforecast.forecastday[i].icon_url;
            var iconURL = "images/weather/" + preURL.substring(28, preURL.length-3) + "png";
            

            console.log(weekDay);
            console.log(date);
            console.log(iconURL);
            console.log(conditions);
            console.log(high_low);
            console.log(pop);
            console.log(' ');

            var fc_day = Forecast.find({Day: i}).fetch();
            var fc_day_id = fc_day[0]._id;

            Forecast.update({_id: fc_day_id}, {$set: {weekDay: weekDay, date: date, icon_url: iconURL,conditions: conditions, hi_low: high_low, pop: pop, }}); 
          }
       }
  });

  //
  // API call to get predicted inches of precipitation
  //
    var apixuKey = Meteor.settings.apixu;
    var url = "https://api.apixu.com/v1/forecast.json?key=" + apixuKey + "&q=23322&days=5"
    
    Meteor.http.call("GET", url, function (error, result) {
          if (error) {
            console.log('Error');
          } else {
            for (var i = 0, len = 5; i < len; i++) {
              var inch_precip = result.data.forecast.forecastday[i].day.totalprecip_in.toFixed(1);
              var fc_day = Forecast.find({Day: i}).fetch();
              var fc_day_id = fc_day[0]._id;

              Forecast.upsert({_id: fc_day_id}, {$set: {inch_precip: inch_precip }}); 
            }
            console.log('precipitation forecasts')
            console.log(result.data.forecast.forecastday[0].day.totalprecip_in);
            console.log(result.data.forecast.forecastday[1].day.totalprecip_in);
            console.log(result.data.forecast.forecastday[2].day.totalprecip_in);
            console.log(result.data.forecast.forecastday[3].day.totalprecip_in);
            console.log(result.data.forecast.forecastday[4].day.totalprecip_in);
          }
  });


}, '600000');

