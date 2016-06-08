#!/usr/bin/env node
'use strict'

const fs = require('fs');
const config = require('./package.json');

class workHelper {
    constructor() {

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

    parseFile() {
        let path = this.getCfgPath();
        if (fs.existsSync(path)) {
            let data = fs.readFileSync(path).toString();
            data = data.replace(/(\/\/.*)|(\/\*[\s\S]*?\*\/)/g,'');
            let cfg = data.match(/cfg[\s+]=[\s+]({[^}]*})/i);
            if (cfg) {
                cfg = JSON.parse(cfg[1]);
                cfg[this.getFeatureName()] = this.getFeaturePath();
                cfg = JSON.stringify(cfg, null, "\t");
            } else {
                cfg = {};
                cfg[this.getFeatureName()] = this.getFeatureName();
                cfg = JSON.stringify(cfg, null, "\t");
            }
            data.replace(/cfg[\s+]=[\s+]({[^}]*})/,'');
            //let writeString = "var cfg = " + cfg;
            let buffer = new Buffer(data);
            fs.writeFile('./test.js',buffer,function(err){
                if(err) throw err;
                console.log('write finished');
            })
        }
    }

    parseLine(text) {

    }
}

var worker = new workHelper();

worker.parseFile();
