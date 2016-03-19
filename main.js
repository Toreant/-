/**
 * Created by apache on 16-3-20.
 */
var exec = require('child_process').exec;
var fs = require('fs');
var iconv = require('iconv-lite');
var co = require('co');
var thunkify = require('thunkify');
var readFile = thunkify(fs.readFile);
var cmdStr = 'sudo ./bin/rjsupplicant/rjsupplicant.sh -a 1 -d 1';

function *read(file) {
    co(function *(){
        try{
            var data = yield readFile('./count.json');
        } catch(ex) {
            console.log(ex.message);
        }
        return Promise.resolve(data);
    }).then(function (data) {
        var str = iconv.decode(data,'gbk');
        var json = JSON.parse(str);
    }).catch(function(ex) {
        console.log(ex.message);
    });
}

function write(user,password) {

    co(function *(){
        try{
            var data = yield readFile('./count.json');
        } catch(ex) {
            console.log(ex.message);
        }

        var str = iconv.decode(data,'gbk'),
            json = JSON.parse(str);

        json = getAloneData(json,user,password);
        writeFile('./count.json',JSON.stringify(json));

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

            writeFile('./count.json',JSON.stringify(input));

        } else {
            console.log(ex.message);
        }
    }).catch(function (ex){
        console.log(ex.message);
    });
}

function getAloneData(data,u,p) {
    var counts = data.data;
    for(var i = 0, len = counts.length; i < len; i++) {
        if(counts[i].count === u && counts[i].password === p) {
            return data;
        }
    }
    data.data.push({"count" : u, "password" : p});
    return data;
}

function writeFile(file,data) {
    fs.writeFile('./count.json',data,function(err) {
        if(err) {
            throw new Error(ex.message);
        }
    });
}

function connect(user,password) {
    cmdStr += ' -u ' + user + ' -p ' + password;
    exec(cmdStr,function(err,stdout,stderr) {
        if(err) {
            console.log(err);
            return;
        } else if(stderr) {
            console.log(stderr);
            return;
        } else if(stdout) {
            console.log(stdout);
            return;
        }
        console.log('连接成功');
    })
}

function defaultConnect(n) {
    co(function *() {
        try {
            var data = yield readFile('./count.json');
        } catch(ex) {
            console.log(ex.message);
        }

        var str = iconv.decode(data,'gbk'),
            json = JSON.parse(str),
            counts = json.data;

        var index = parseInt(n);

        if(index >= counts.length || counts.length === 0) {
            console.log('no count');
        } else if(isNaN(index)) {
            connect(counts[0].count,counts[0].password);
        } else {
            connect(counts[index].count,counts[index].password);
        }
    }).catch(function(ex) {
        console.log(ex.message);
    });
}

function list() {
    co(function *(){
        try {
            var data = yield readFile('./count.json');
        } catch(ex) {
            console.log(ex.message);
        }
        var str = iconv.decode(data,'gbk'),
            json = JSON.parse(str),
            counts = json.data;
        for(var i = 0, num = counts.length; i < num; i++) {
            console.log('[' + i +']',counts[i].count + ' ---- ' + counts[i].password);
        }
    }).catch(function(ex) {
        console.log(ex.message);
    });
}

module.exports = function(type,user,password,index) {
    switch(type) {
        case 's' :
            write(user,password);
            connect(user,password);
            break;
        case 'l' :
            list();
            break;
        default :
            defaultConnect(index);
    }
};