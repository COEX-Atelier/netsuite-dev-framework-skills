/**
 * SuiteScript JSDoc Header Validator
 * Checks for mandatory tags: @NApiVersion, @NScriptType, @NModuleScope
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
    console.error('Error: Please provide a file path to validate.');
    process.exit(1);
}

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const tags = {
        '@NApiVersion': /@NApiVersion\s+2\.[01x]/,
        '@NScriptType': /@NScriptType\s+\w+/,
        '@NModuleScope': /@NModuleScope\s+\w+/
    };

    let allValid = true;
    for (const [tag, regex] of Object.entries(tags)) {
        if (!regex.test(content)) {
            console.error(`❌ Missing or invalid tag: ${tag}`);
            allValid = false;
        } else {
            console.log(`✅ Tag found: ${tag}`);
        }
    }

    if (!allValid) {
        process.exit(1);
    } else {
        console.log('---');
        console.log('Success: All mandatory SuiteScript headers are present.');
    }
} catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
}
