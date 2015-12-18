function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var vbox = require('../').vboxmanager,
    request = require('supertest'),
    should = require('should');
var myVMS = [];
var box = null;
var new_box = null;
//this config is for remote connection with is not going to test itself by default
var config = require('./config');
if (typeof config === 'undefined') {
    console.log('using local connection');
} else {
    vbox.setRemote(config.host, config.options);
    console.log('using remote connection');
}
describe('VBoxManager', function() {
    describe('#getVMS', function() {
        it('should be an instance of vbox', function(done) {
            vbox.createVm('testVm'+makeid(), function(error, vm) {
                var iserror = (typeof error != 'undefined');
                iserror.should.be.equal(false);
                vm.should.be.an.instanceOf(vbox);
                box = vm;
                done();
            });
        });
    });
    describe('VBoxManager basic', function() {
        describe('#getVMS', function() {
            it('should return an array', function(done) {
                vbox.getVMS(function(vms) {
                    myVMS = vms;
                    vms.should.be.an.instanceOf(Array);
                    done();
                });
            });
        });
        describe('#getInfos', function() {
            it('should return an object', function(done) {
                box.getInfos(function(infos) {
                    var exists = infos.name !== undefined;
                    exists.should.be.equal(true);
                    done();
                });
            });
        });
        describe('#getState', function() {
            it('should return poweroff|running|paused if called with param', function(done) {
                box.getInfos(function(infos) {
                    box.getState(infos, function(state) {
                        var status = ['poweroff', 'running', 'paused'].indexOf(state) != -1;
                        status.should.be.equal(true);
                        done();
                    });
                });
            });
            it('should return poweroff|running|paused if called without param', function(done) {
                box.getInfos(function(infos) {
                    box.getState(function(state) {
                        //['poweroff', 'running', 'paused'].should.include(state);
                        var status = ['poweroff', 'running', 'paused'].indexOf(state) != -1;
                        status.should.be.equal(true);
                        done();
                    });
                });
            });
        });
    });
    describe('VBoxManager Scenarios', function() {
        it('should not stop a machine not started', function(done) {
            box.stop(function(value) {
                value.should.be.false;
                done();
            });
        });
        it('should start a machine not started', function(done) {
            box.start(function(value) {
                value.should.be.true;
                done();
            });
        });
        it('should resume a machine paused', function(done) {
            box.pause(function() {
                box.start(function(value) {
                    value.should.be.true;
                    done();
                });
            });
        });
        it('should not start a machine started', function(done) {
            box.start(function(value) {
                value.should.be.false;
                done();
            });
        });
        it('should stop a machine started', function(done) {
            box.stop(function(value) {
                value.should.be.true;
                done();
            });
        });
    });
    describe('VBoxManager Configure VM', function() {
        it('should upgrate the memory to 100M', function(done) {
            box.setMemory(100, function(error) {
                error.should.equal.false;
                done();
            });
        });
        it('should upgrate the number of cpus to 3', function(done) {
            box.setCPUS(3, function(error) {
                error.should.equal.false;
                done();
            });
        });
    });
    describe('VBoxManager Manage VM', function() {
        it('should clone a VM', function(done) {
            box.cloneMe('new_vm', function(error, clone_box) {
                new_box = clone_box;
                error.should.equal.false;
                done();
            });
        });
        it('should delete the clone', function(done) {
            new_box.killMe(function(error) {
                error.should.be.equal(true);
                done();
            });
        });
        it('should delete the test vm', function(done) {
            setTimeout(function() {
                box.killMe(function(error) {
                    error.should.be.equal(true);
                    done();
                });
            }, 500);
        });
    });
});
