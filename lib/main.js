/**
 * Created by apache on 16-3-20.
 */
var childProcess = require('child_process');
var iconv = require('iconv-lite');
var co = require('co');
var fs = require('co-fs');
var colors = require('colors');
var nconf = require('nconf');
var thunkify = require('thunkify');
var exec = thunkify(childProcess.exec);
var cmdStr = 'sudo ../source/rjsupplicant/rjsupplicant.sh -a 1 -d 1';
var file = './count.json';

function *_read(file) {
    var data = yield fs.readFile(file);
    var str = iconv.decode(data,'utf8');
    return Promise.resolve(JSON.parse(str).data);
}

function _getAloneData(counts,u,p) {
    for(var i = 0, len = counts.length; i < len; i++) {
        if(counts[i].count === u && counts[i].password === p) {
            return counts;
        }
    }
    counts.push({"count" : u, "password" : p});
    return counts;
}

var fn = {};

fn.list = function() {
    co(function *(){
        var counts = yield _read(file);
        for(var i = 0, num = counts.length; i < num; i++) {
            console.log(('[' + i + ']').green,counts[i].count.blue + ' ---- ' + counts[i].password);
        }
    }).catch(function(ex) {
        console.log(ex.message);
    });
};

fn.write = function(user,password) {

    co(function *(){
        var counts = yield _read(file);
        // 只保存一个相同的账号
        counts = _getAloneData(counts,user,password);
        fs.writeFile(file,JSON.stringify({"data": counts}));
    }).catch(function(ex) {

        if(ex.message === 'Unexpected end of input') {
            // 文件为空时，重新写入
            var input = {
                "data" : [
                    {
                        "count" : user,
                        "password" : password
                    }
                ]
            };

            fs.writeFile(file,JSON.stringify(input));

        } else {
            console.log(ex.message);
        }
    }).catch(function (ex){
        console.log(ex.message);
    });
};

fn.connect = function(user,password) {
    cmdStr += ' -u ' + user + ' -p ' + password;
    co(function *(){
        var situation = yield exec(cmdStr);
        return Promise.resolve(situation);
    }).then(function(situation) {

        // 密码错误或其他错误时
        console.log(situation[0]);
    }).catch(function(ex) {
        console.log(ex.message);
    });
};

fn.defaultConnect = function(n) {
    var self = this;

    co(_read(file))
        .then(function(counts) {

            var index = parseInt(n);
            if(index >= counts.length || counts.length === 0) {
                console.log('no count');
            } else if(isNaN(index)) {
                self.connect(counts[0].count,counts[0].password);
            } else {
                self.connect(counts[index].count,counts[index].password);
            }
        }).catch(function(ex) {
        console.log(ex.message);
    });
};

fn.delete = function(n) {

    co(function *(){
        var data = yield _read(file);
        if(n >= data.length) {
            throw new Error('下表超出界限')
        } else {
            var tmp = data.filter(function(item,index) {
                return index !== n;
            });
        }
        var result = yield fs.writeFile(file,JSON.stringify({'data' : tmp}));
        return Promise.resolve(result);
    }).then(function(data) {
        if(!data) {
            console.log('删除成功'.green);
        }
    }).catch(function(ex) {
        console.log(ex.message);
    });
};

module.exports = fn;
