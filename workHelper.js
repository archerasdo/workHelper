#!/usr/bin/env node
'use strict';

const fs = require('fs');
const config = require('./package.json');
const p = require('path');
const callCmd = require('child_process');
const program = require('commander');

class workHelper {
    constructor(fn,fp) {
        this.path = config.cfgPath;
        if (fs.existsSync(this.path)) {
            this.file = fs.readFileSync(this.path).toString();
        } else {
            console.log('配置文件路径有误,找不到fdserver配置文件')
        }
    }


    //删除行内注释和段落注释
    deleteCodeComments(data) {
        // http://排除方式,将'://'全部替换为特殊字符，删除注释代码后再将其恢复回来
        const tmp1 = ':\/\/';
        const regTmp1 = /:\/\//g;
        const tmp2 = '@:@/@/@';
        const regTmp2 = /@:@\/@\/@/g;
        data = data.replace(regTmp1, tmp2);
        const reg = /(\/\/.*)|(\/\*[\s\S]*?\*\/)/g;
        data = data.replace(reg, '');
        return data.replace(regTmp2, tmp1);
    }

    //调整cfg对象,将新增分支目录写入cfg对象
    parseCfg(data,fn,fp) {
        let cfg = data.match(/cfg[\s+]=[\s+]({[^}]*})/i);
        if (cfg) {
            cfg = JSON.parse(cfg[1]);
            cfg[fn] = fp;
            cfg = JSON.stringify(cfg, null, "\t");
            return data.replace(/cfg[\s+]=[\s+]({[^}]*})/,function(m,p1){
                return "cfg = " + cfg;
            });
        } else {
            cfg = {};
            cfg[fn] = fp;
            cfg = JSON.stringify(cfg, null, "\t");
            return 'cfg = '+ cfg + data;
        }

    }
    getAllFeature(){
        let features = this.file.match(/cfg[\s+]=[\s+]({[^}]*})/i);
        if (features) {
            features = JSON.parse(features[1]);
                for(let i in Object.keys(features)) {
                    console.log(Object.keys(features)[i]);
                }
        } else {
            console.log('暂未配置分支')
        }
    }

    parseStyleRoot(data,fn) {
        return data.replace(/root[\s]?:[\s]?(.*)/g,'root: cfg["'+ fn + '"],');
    }

    switchFeature(fn) {
        let features = JSON.parse(this.file.match(/cfg[\s+]=[\s+]({[^}]*})/i)[1]);
        console.log(Object.keys(features))
        console.log(fn);
        if (features && Object.keys(features).indexOf(fn) >=0 ) {
            let data = this.parseStyleRoot(this.file,fn);
            this.writeFile(this.path,data);
            this.startFdServer();
        } else {
            console.log('分支不存在');
        }
    }

    writeFile(path,data){
        fs.renameSync(path,path+'.default');
        let buffer = new Buffer(data);
        fs.writeFile(path,buffer,function(err){
            if(err) throw err;
            console.log('write finished');
        });
    }

    startFdServer(){
        callCmd.execFile('server.sh',function(error,stdout,stderr){
            if (error) {
                console.log('stderr:'+stderr)
            }
        })
    }

    deployFile(fn,fp) {
            var data = this.deleteCodeComments(this.file);
            data = this.parseCfg(data,fn,fp);
            data = this.parseStyleRoot(data,fn);
            this.writeFile(this.path,data);
            this.startFdServer();
    }
}

program.version('0.0.1')
    .option('-n,--fname [value]','设置分支名称')
    .option('-p,--fpath [value]','设置分支路径')
    .parse(process.argv);
var worker = new workHelper();
if (program.fname) {
    if(program.fpath) {
        worker.deployFile(program.fname,program.fpath);
        console.log('deploy')
    } else {
        worker.switchFeature(program.fname);
        console.log('switch')
    }
} else {
    worker.getAllFeature();
}

