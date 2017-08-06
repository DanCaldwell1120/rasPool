import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

//***************************************
//
//        Login
//
//***************************************

Accounts.ui.config({
     passwordSignupFields: "USERNAME_ONLY"
});

Accounts.config({
     forbidClientAccountCreation: true
});

//***************************************
//
//        Time
//
//***************************************

Template.Title.helpers({
  currentTime() {
    var ST = RasPool.find({Component: "systemTime"}).fetch();
    var date = ST[0].currentTime;
    var begun = moment(date).format('MMMM Do YYYY, h:mm A');
  
    return begun;
  }
});

//***************************************
//
//        Recirc Pump
//
//***************************************

Template.RecircPump.onCreated(function RecircPumpOnCreated() {
  // Pump is Off
  var RP = RasPool.find({Component: "RecircPump"}).fetch();
  $('#js-StartTime').val("09:00");
  $('#js-StopTime').val("21:00");

});

Template.RecircPump.helpers({
  Status() {
    var RP = RasPool.find({Component: "RecircPump"}).fetch();
    return RP[0].Status;
  },
  StartTime() {
    var RP = RasPool.find({Component: "RecircPump"}).fetch();
    return RP[0].StartTime;
  },
  StopTime() {
    var RP = RasPool.find({Component: "RecircPump"}).fetch();
    return RP[0].StopTime;  
  },
});

Template.RecircPump.events({
  'click button#js-Start'(event, instance) {
    // Turn Pump ON
    Meteor.call('startRecircPump');
  },
  'click button#js-Stop'(event, instance) {
    // Turn Pump OFF
    Meteor.call('stopRecircPump');
  },
  'blur input#js-StartTime'(event, instance) {
    // Update Start Time
    var RP = RasPool.find({Component: "RecircPump"}).fetch();
    var RPid = RP[0]._id;

    RasPool.update(
      {_id: RPid},
      {$set: {StartTime: $('#js-StartTime').val()}},
    );
  },
  'blur input#js-StopTime'(event, instance) {
    // Update Start Time
    var RP = RasPool.find({Component: "RecircPump"}).fetch();
    var RPid = RP[0]._id;

    RasPool.update(
      {_id: RPid},
      {$set: {StopTime: $('#js-StopTime').val()}},
    );
  },
});

//***************************************
//
//        Booster Pump
//
//***************************************

Template.BoosterPump.onCreated(function BoosterPumpOnCreated() {
  // Pump is Off

});

Template.BoosterPump.helpers({
  Status() {
    var BP = RasPool.find({Component: "BoosterPump"}).fetch();
    return BP[0].Status;
  },
  
  TimeRemaining() {
    var BP = RasPool.find({Component: "BoosterPump"}).fetch();
   
    return BP[0].TimeRemaining;
  },
});

Template.BoosterPump.events({
  'click button#js-Start'(event, instance) {
      Meteor.call('startBoosterPump', $('#js-RunTime').val());
   },
  'click button#js-Stop'(event, instance) {
      Meteor.call('stopBoosterPump');
  },
});

//***************************************
//
//        Pool Light
//
//***************************************

Template.PoolLight.onCreated(function PoolLightOnCreated() {
  // Light is Off

});

Template.PoolLight.helpers({
  Status() {
    var PL = RasPool.find({Component: "PoolLight"}).fetch();
    return PL[0].Status;
  },
});

Template.PoolLight.events({
  'click button#js-On'(event, instance) {
    Meteor.call('turnPoolLightOn');    
   },
  'click button#js-Off'(event, instance) {
    Meteor.call('turnPoolLightOff');
  },
});

//***************************************
//
//        Add Water
//
//***************************************

Template.AddWater.onCreated(function AddWaterOnCreated() {
  //  Valve is SHUT

});

Template.AddWater.helpers({
  Status() {
    var AW = RasPool.find({Component: "WaterValve"}).fetch();
    return AW[0].Status;
  },
  
  TimeRemaining() {
    var AW = RasPool.find({Component: "WaterValve"}).fetch();
 
    var tr = AW[0].TimeRemaining;
    return tr;
  },
});

Template.AddWater.events({
  'click button#js-Open'(event, instance) {
      Meteor.call('openWaterValve',$('#js-Inches').val());
  },
  'click button#js-Shut'(event, instance) {
      Meteor.call('shutWaterValve');
  },
});


//***************************************
//
//        Salt Cell
//
//***************************************

Template.SaltCell.onCreated(function SaltCellOnCreated() {
  //  Valve is SHUT

});

Template.SaltCell.helpers({
  Status() {
    var SC = RasPool.find({Component: "SaltCell"}).fetch();
    return SC[0].Status;
  },
  
  TimeRemaining() {
    var SC = RasPool.find({Component: "SaltCell"}).fetch();
    var tr = SC[0].TimeRemaining;
    return tr;
  },
});

Template.SaltCell.events({
    // Start Super Chlorinate
  'click button#js-SCStart'(event, instance) {
    var SC = RasPool.find({Component: "SaltCell"}).fetch();
    var SCid = SC[0]._id;
    
    RasPool.update(
      {_id: SCid},
      {$set: {Status: "SuperChlorinate"}},
    );
    $("#SCimg").show();
    $("#OUTimg").hide();
    $("#SCtr").show();

    var d = new Date();
    var ms = (d.getTime() + $('#js-SCtime').val()*60*60*1000);
    var et = new Date(ms);
    RasPool.update(
      {_id: SCid},
      {$set: {EndTime: et}},
    );
   },

  'click button#js-SCStop'(event, instance) {
    // Stop Super Chlorinate
    var SC = RasPool.find({Component: "SaltCell"}).fetch();
    var SCid = SC[0]._id;
    
    if ($('#js-Percent').val() == 0) {
      RasPool.update(
        {_id: SCid},
        {$set: {Status: "OFF"}},
      ); 
    } else {
      RasPool.update(
        {_id: SCid},
        {$set: {Status: "AUTO"}},
      ); 
      $("#OUTimg").show();
    }
    RasPool.update(
      {_id: SCid},
      {$set: {PercentOutput: $("#js-Percent").val()}},
    );
    $("#SCimg").hide();    
    $("#SCtr").hide(); 
  },

  'blur input#js-Percent'(event, instance) {
    // Update PercentOutput
    var SC = RasPool.find({Component: "SaltCell"}).fetch();
    var SCid = SC[0]._id;

    RasPool.update(
      {_id: SCid},
      {$set: {PercentOutput: $('#js-Percent').val()}},
    );
    if (SC[0].Status != "SuperChlorinate") { 
      if ($('#js-Percent').val() == 0) {
        RasPool.update(
          {_id: SCid},
          {$set: {Status: "OFF"}},          
        ); 
        $("#OUTimg").hide();
      } else {
        RasPool.update(
          {_id: SCid},
          {$set: {Status: "AUTO"}},
        ); 
        $("#OUTimg").show();
      }
    }
  },
});

//***************************************
//
//        Status Info
//
//***************************************

Template.StatusInfo.helpers({
  curTemp() {
    var ST = RasPool.find({Component: "systemTime"}).fetch();
    return ST[0].currentTemp;
  },
  wtrTemp() {
    var ST = RasPool.find({Component: "systemTime"}).fetch();
    return ST[0].waterTemp;
  }
});

//***************************************
//
//        Pool Picture
//
//***************************************

const fileName = '/static/poolPic.jpg';

Template.poolPic.onRendered(() => {
  Image.find().observeChanges({
    changed(id, fields) {
      // this is how you get your image to update in the client without refreshing.
      // the '?t=' + new Date().valueOf() code keeps the same URL but prevents your browser
      // from just keeping a cached version.
      $('img#poolimg').prop('src', fileName + '?t=' + new Date().valueOf());
    }
  });
});

Template.poolPic.helpers({
  'fileName': () => {
    return fileName;
  }
});


//***************************************
//
// Periodic Status Update
//
//***************************************


Meteor.setInterval(function(){

//
// Check Recirc Pump Start/Stop times
//  

  var RP = RasPool.find({Component: "RecircPump"}).fetch();
  
  if ($('#js-StartTime').is(':focus')) {

  } else {
    $('#js-StartTime').val(RP[0].StartTime);
  }

  if ($('#js-StopTime').is(':focus')) {

  } else {
    $('#js-StopTime').val(RP[0].StopTime);
  }

  if (RP[0].Status == "ON") {
    $("#RPimg").show();
  }

  if (RP[0].Status == "OFF") {
    $("#RPimg").hide();
  }

//
// Check Booster Pump Stop times
//  

  var BP = RasPool.find({Component: "BoosterPump"}).fetch();

  if (BP[0].Status == "ON") {
    $("#BPimg").show();
    $("#BPtr").show();
  }

  if (BP[0].Status == "OFF") {
    $("#BPimg").hide();
    $("#BPtr").hide();
  }

//
// Check Pool Light Status
//  

  var PL = RasPool.find({Component: "PoolLight"}).fetch();

  if (PL[0].Status == "ON") {
    $("#PLimg").show();
  }

  if (PL[0].Status == "OFF") {
    $("#PLimg").hide();
  }


//
// Check Water Valve Stop times
//  

  var AW = RasPool.find({Component: "WaterValve"}).fetch();
  
  if (AW[0].Status == "OPEN") {
    $("#AWimg").show();
    $("#AWtr").show();
  }

  if (AW[0].Status == "SHUT") {
    $("#AWimg").hide();
    $("#AWtr").hide();
  }

//
// Check Super Chlorinate Stop times
//  

  var SC = RasPool.find({Component: "SaltCell"}).fetch();
  var SCid = SC[0]._id;
  var SCCurrent = new Date().getTime();
  var End = SC[0].EndTime.getTime();
  var tr = Math.floor((End - SCCurrent)/3600000);

  if ($('#js-Percent').is(':focus')) {

  } else {
    $('#js-Percent').val(SC[0].PercentOutput);
  }

  if (SC[0].Status == "SuperChlorinate") {
    $("#SCimg").show();
    $("#SCtr").show(); 
    $("#OUTimg").hide();
  } else if (SC[0].Status == "AUTO") {
    $("#SCimg").hide();
    $("#SCtr").hide(); 
    $("#OUTimg").show();
  } else {
    $("#SCimg").hide();
    $("#SCtr").hide(); 
    $("#OUTimg").hide();
  }

  if ((tr <= 0) && (SC[0].Status == "SuperChlorinate")) {
    if ($('#js-Percent').val() == 0) {
      RasPool.update(
        {_id: SCid},
        {$set: {Status: "OFF"}},
      ); 
    } else {
      RasPool.update(
        {_id: SCid},
        {$set: {Status: "AUTO"}},
      ); 
      $("#OUTimg").show();
    }
    RasPool.update(
      {_id: SCid},
      {$set: {PercentOutput: $("#js-Percent").val()}},
    );
    $("#SCimg").hide();    
    $("#SCtr").hide(); 
  }

//
// Update Pool Picture
//

  }, '500'
);
