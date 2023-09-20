import * as fs from 'fs';

function compareJSON(json1: any, json2: any, path: string[] = []): { missingInFirst: string[], missingInSecond: string[], differingProperties: string[], differingPropertyTypes: string[] } {
    const missingInFirst: string[] = [];
    const missingInSecond: string[] = [];
    const differingProperties: string[] = [];
    const differingPropertyTypes: string[] = [];

    for (const key in json1) {
        
        if (json2.hasOwnProperty(key)) {
            if (typeof json1[key] !== typeof json2[key]) {
                console.log(`1: ${key} typeof: ${typeof json1[key]}`);
                const val = `key: ${typeof json1[key]} vs ${typeof json2[key]}`;
                differingPropertyTypes.push(val);
            } else if (Array.isArray(json1[key]) && Array.isArray(json2[key])) {
                
                if (json1[key].length !== json2[key].length) {
                    console.log(`2: ${key} typeof: ${typeof json1[key]}`);
                    const val = `key: ${key} array length differs`;
                    differingPropertyTypes.push(val);
                } else {
                    console.log(`3: ${key} typeof: ${typeof json1[key]}`);
                    const deeperComparison = compareJSON(json1[key], json2[key], [...path, key]);
                    missingInFirst.push(...deeperComparison.missingInFirst);
                    missingInSecond.push(...deeperComparison.missingInSecond);
                    differingProperties.push(...deeperComparison.differingProperties);
                }
            } else {

                if (typeof json1[key] === 'object' && json1[key] !== null  && typeof json2[key] === 'object' && json2[key] !== null) {
                    console.log(`4: ${key} typeof: ${typeof json1[key]}`);
                    const deeperComparison = compareJSON(json1[key], json2[key], [...path, key]);
                    missingInFirst.push(...deeperComparison.missingInFirst);
                    missingInSecond.push(...deeperComparison.missingInSecond);
                    differingProperties.push(...deeperComparison.differingProperties);
                } else if (json1[key] !== json2[key]) {
                    console.log(`5: ${key} typeof: ${typeof json1[key]}`);
                    const val = [...path, key].join('.');
                    differingProperties.push(`${val}: ${json1[key]} vs ${json2[key]}`);
                }
            }
        } else {
            console.log(`7: ${key} typeof: ${typeof json1[key]}`);
            missingInSecond.push([...path, key].join('.'));
        }
    }

    for (const key in json2) {
        if (!json1.hasOwnProperty(key)) {
            missingInFirst.push([...path, key].join('.'));
        }
    }

    return {
        missingInFirst,
        missingInSecond,
        differingProperties,
        differingPropertyTypes
    };
}

function compareJSONFiles(file1: string, file2: string) {
    const json1 = JSON.parse(fs.readFileSync(file1, 'utf-8'));
    const json2 = JSON.parse(fs.readFileSync(file2, 'utf-8'));

    return compareJSON(json1, json2);
}

// Example usage:
const differences = compareJSONFiles('/Users/paulryan/Documents/projects.nosync/panoram/appregistrationscript/output/output.json', '/Users/paulryan/Documents/projects.nosync/panoram/appregistrationscript/input/manifest.json');
console.log('Properties missing in first file:', differences.missingInFirst);
console.log('Properties missing in second file:', differences.missingInSecond);
console.log('Properties differing between files:', differences.differingProperties);
console.log('Properties differing types between files:', differences.differingPropertyTypes);
