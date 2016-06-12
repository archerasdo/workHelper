#!/usr/bin/env node
'use strict';

const fs = require('fs');
const config = require('./package.json');
const p = require('path');
const callCmd = require('child_process');


class workHelper {
    constructor() {
        if()
    }

    getFeatureName() {
        return process.argv[2]
    }

    getFeaturePath() {
        return process.argv[3];
    }

    getCfgPath() {
        return config.cfgPath;
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
    parseCfg(data) {
        let cfg = data.match(/cfg[\s+]=[\s+]({[^}]*})/i);
        if (cfg) {
            cfg = JSON.parse(cfg[1]);
            cfg[this.getFeatureName()] = this.getFeaturePath();
            cfg = JSON.stringify(cfg, null, "\t");
            return data.replace(/cfg[\s+]=[\s+]({[^}]*})/,function(m,p1){
                return "cfg = " + cfg;
            });
        } else {
            cfg = {};
            cfg[this.getFeatureName()] = this.getFeaturePath();
            cfg = JSON.stringify(cfg, null, "\t");
            return 'cfg = '+ cfg + data;
        }

    }

    parseStyleRoot(data) {
        return data.replace(/root[\s]?:[\s]?(.*)/g,'root: cfg["'+this.getFeatureName() + '"],');
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

    parseFile() {
        let path = this.getCfgPath();
        if (fs.existsSync(path)) {
            let data = fs.readFileSync(path).toString();
            data = this.deleteCodeComments(data);
            data = this.parseCfg(data);
            data = this.parseStyleRoot(data);
            this.writeFile(path,data);
            this.startFdServer();
        }
    }
}

var worker = new workHelper();
worker.parseFile();