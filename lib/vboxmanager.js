var exec = require('child_process').exec,
    utils = require('./utils');
var vboxmanager = function(uid, name) {
    if (typeof uid == 'undefined' || typeof name == 'undefined') {
        throw new Error("uid or name should be defined");
    } else {
        var self = this;
        this.uid = uid;
        this.name = name;
    }
}
vboxmanager.prefix = 'VBoxManage ';
vboxmanager.setRemote = function(host, option) {
    var remoteExec = require('remote-exec');
    exec = function(command, callback) {
        tmpfile = option.tmpfile ? option.tmpfile : './out.txt';
        option.stdout = require('fs').createWriteStream(tmpfile)
        var u = remoteExec(host, command, option, function(err) {
            var output = require('fs').readFileSync(tmpfile).toString('utf8');
            callback(err, output);
        });
    }
}
vboxmanager.createVm = function(name, cb) {
    exec(vboxmanager.prefix + 'createvm --name "' + name + '" --register', function(error, stdout, stderr) {
        if (error) {
            cb(error);
        }
        var uid = stdout.split('\n')[1].split('UUID: ')[1];
        cb(undefined, new vboxmanager(uid, name));
    });
}
vboxmanager.getVMS = function(callback) {
    exec(vboxmanager.prefix + 'list vms', function(error, stdout, stderr) {
        var vmsArray = [];
        var vms = stdout.split('\n');
        for (var k in vms) {
            var data = vms[k].match(/"(.*)" {(.*)}/);
            if (data !== null) {
                var name = data[1];
                var uid = data[2]
                vmsArray.push(new vboxmanager(uid, name));
            }
        }
        callback(vmsArray);
    });
}
vboxmanager.prototype.getInfos = function(callback) {
    var self = this;
    exec(vboxmanager.prefix + 'showvminfo ' + this.uid + ' --machinereadable', function(error, stdout, stderr) {
        var infos = utils.str_replace('\n', ',', stdout);
        infos = utils.str_replace('=', ':', infos).substr(0, infos.length - 1);
        infos = eval('({' + infos + '})');
        callback(infos);
    });
    return this;
};
vboxmanager.prototype.getState = function(infos, callback) {
    var self = this;
    var returnState = function(data) {
        !callback ? infos(data.VMState) : callback(data.VMState);
    };
    if (infos && !callback || !infos && callback) {
        this.getInfos(function(infos) {
            returnState(infos);
        });
    } else {
        returnState(infos);
    }
    return this;
};
vboxmanager.prototype.start = function(callback) {
    var self = this;
    this.getState(function(state) {
        if (state == 'paused') {
            exec(vboxmanager.prefix + 'controlvm ' + self.uid + ' resume', function(error, stdout, stderr) {
                callback(error === null);
            });
        } else {
            exec(vboxmanager.prefix + 'startvm ' + self.uid + ' --type headless', function(error, stdout, stderr) {
                callback(error === null);
            });
        }
    })
    return this;
};
vboxmanager.prototype.stop = function(callback) {
    exec(vboxmanager.prefix + 'controlvm ' + this.uid + ' poweroff', function(error, stdout, stderr) {
        callback(error === null);
    });
    return this;
};
vboxmanager.prototype.pause = function(callback) {
    exec(vboxmanager.prefix + 'controlvm ' + this.uid + ' pause', function(error, stdout, stderr) {
        callback(error === null);
    });
    return this;
};
vboxmanager.prototype.setMemory = function(memory, callback) {
    exec(vboxmanager.prefix + 'modifyvm ' + this.uid + ' --memory ' + memory, function(error, stdout, stderr) {
        callback(error === null);
    });
    return this;
};
vboxmanager.prototype.setCPUS = function(cpus, callback) {
    exec(vboxmanager.prefix + 'modifyvm ' + this.uid + ' --cpus ' + cpus, function(error, stdout, stderr) {
        callback(error === null);
    });
    return this;
};
vboxmanager.prototype.cloneMe = function(new_name, callback) {
    exec(vboxmanager.prefix + 'clonevm ' + this.uid + ' --name "' + new_name + '" --register', function(error, stdout, stderr) {
        if (error !== null) {
            callback(error === null, null);
        } else {
            vboxmanager.getVMS(function(vms) {
                for (var k in vms) {
                    if (vms[k].name === new_name) {
                        callback(error === null, vms[k]);
                    }
                }
            });
        }
    });
    return this;
};
vboxmanager.prototype.killMe = function(callback) {
    exec(vboxmanager.prefix + 'unregistervm ' + this.uid + ' --delete', function(error, stdout, stderr) {
        callback(error === null);
    });
    return this;
};
exports.vboxmanager = vboxmanager;
