const branch = require('./branch-coverage');
const master = require('./master-coverage');
const _ = require('lodash');
const chalk = require('chalk');
const art = require('ascii-art');
const Table = require('cli-table');


const calculatePercentage = (object) => {
    const lines = Object.keys(object).map((key) => +Boolean(object[key])).reduce((prev, curr) => prev + curr, 0);
    const linesCovered = lines/Object.keys(object).length;
    return (!lines && !linesCovered) ? 100 : linesCovered * 100;
};

const calculatePercentages = ({ l: lines, s: statements, f: functions, b: branches }) => ({
    lines: calculatePercentage(lines),
    statements: calculatePercentage(statements),
    functions: calculatePercentage(functions),
    branches: calculatePercentage(branches),
});

const getColor = (value) => {
    if (value < 0) {
        return chalk.red(`${value}%`);
    } else if (value > 0) {
        return chalk.green(`${value}%`);
    } else {
        return chalk.yellow(`${value}%`);
    }
}

const branchFiles = Object.keys(branch);
const masterFiles = Object.keys(master);

const newFiles = _.difference(branchFiles, masterFiles);
const removedFiles = _.difference(masterFiles, branchFiles);

const notEditedFiles = _.concat(newFiles, removedFiles);

const allFiles = _.union(branchFiles, masterFiles);

const potentiallyEditedFiles = allFiles.filter((file) => !notEditedFiles.includes(file));

const editedFiles = _.compact(potentiallyEditedFiles.map((file) => {
    const masterPercentages = calculatePercentages(master[file]);
    const branchPercentages = calculatePercentages(branch[file]);

    if (!_.isEqual(masterPercentages, branchPercentages)) {
        return {
            file,
            lines: branchPercentages.lines - masterPercentages.lines,
            statements: branchPercentages.statements - masterPercentages.statements,
            functions: branchPercentages.functions - masterPercentages.functions,
            branches: branchPercentages.branches - masterPercentages.branches,
        }
    }
}));

art.font('Coverage Changes', 'Doom', function(rendered){
    console.log(rendered);
    const table2 = new Table();

    table2.push([
        chalk.bold('File'),
        chalk.bold('Lines'),
        chalk.bold('Statements'),
        chalk.bold('Functions'),
        chalk.bold('Branches'),
    ]);

    editedFiles.forEach(({file, lines, statements, functions, branches}) => {
        table2.push([
            file,
            getColor(lines),
            getColor(statements),
            getColor(functions),
            getColor(branches),
        ]);
    })

    console.log(table2.toString());
});
