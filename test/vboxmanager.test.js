var vbox    = require('../').vboxmanager
  , request = require('supertest')
  , should  = require('should');

var myVMS = [];
var box   = null;

var waitPlease = function(callback){
  setTimeout(callback , 2000);
}

describe('VBoxManager',function(){
  describe('#getVMS',function(){
    it('should return an array', function(done){
      vbox.getVMS(function(vms){
        myVMS = vms;
        box   = myVMS[0];
        vms.should.be.an.instanceOf(Array);
        done();
      });
    });
  });
  describe('#getInfos',function(){
    it('should return an object', function(done){
      box.getInfos(function(infos){
        var exists = infos.name !== undefined;
        exists.should.equal(true);
        done();
      });
    });
  });
  describe('#getState',function(){
    it('should return poweroff|running|paused if called with param', function(done){
      box.getInfos(function(infos){
        box.getState(infos , function(state){
          ['poweroff' , 'running' , 'paused'].should.include(state);
          done();
        });
      });
    });
    it('should return poweroff|running|paused if called without param', function(done){
      box.getInfos(function(infos){
        box.getState(function(state){
          ['poweroff' , 'running' , 'paused'].should.include(state);
          done();
        });
      });
    });
  });
});

describe('VBoxManager Scenarios',function(){
  it('should not stop a machine not started' , function(done){
    box.stop(function(value){
      value.should.be.false;
      done();
    });
  });
  it('should start a machine not started' , function(done){
    box.start(function(value){
      value.should.be.true;
      done();
    });
  });
  it('should resume a machine paused' , function(done){
    box.pause(function(){
      box.start(function(value){
        value.should.be.true;
        done();
      });
    });
  });
  it('should not start a machine started' , function(done){
    box.start(function(value){
      value.should.be.false;
      done();
    });
  });
  it('should stop a machine started' , function(done){
    box.stop(function(value){
      value.should.be.true;
      done();
    });
  });
});
