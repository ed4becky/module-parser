#!/usr/bin/env node
import {parseProject} from './main';
import yargs = require("yargs");
import { hideBin } from 'yargs/helpers'

const argv: any = yargs(hideBin(process.argv))
    .option({
        fix: {type: 'boolean', description: 'option to fix what errors it can.  makes best guess'},
    })
    .help()
    .argv;

parseProject(argv);



