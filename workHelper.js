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
                console.log(cfg);
            } else {
                let newCfg = {};
                newCfg[this.getFeatureName()] = this.getFeatureName();
                newCfg = JSON.stringify(newCfg, null, "\t");
                console.log(newCfg)
            }
        }
    }

    parseLine(text) {

    }
}

var worker = new workHelper();

worker.parseFile();
