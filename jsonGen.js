var fs         = require('fs'),
    dot        = require('dot'),
    actionKeys = [
        'repeat:',
        'random:'
    ],
    finalResult;

//readFile(process.argv[process.argv.length - 1]);
readFile('sample2.json');

function readFile (filePath) {
    if (filePath === undefined && filePath.length > 0) {
        console.log('file is not undefined', filePath);
        return;
    }
    if (filePath.indexOf('.json') === -1) {
        console.log('This is not a json file:', filePath, filePath.indexOf('.json'));
        return;
    }

    var contents    = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);

    finalResult = runCompiler(readLine(undefined, jsonContent));

    
    // console.log(JSON.parse(resultText));

    writeJsonToFile('generatedFile.json', JSON.parse(finalResult));
}

function runCompiler(template) {
    // register some functions for template use
    var fn = {
        random: function() {
            return ~~(Date.now()/1000 * Math.random())   
        }
    };

    var tempFn = dot.template(JSON.stringify(template, null, 2), undefined, fn);
    var resultText = tempFn({rand: fn.random()});   

    return resultText;
}

function writeJsonToFile(filename, data) {
    fs.writeFile(filename, JSON.stringify(data, null, 2), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + filename);
        }
    });
}

function isActionKey (key) {
    for (var i = 0; i < actionKeys.length; i++) {
        if (key.indexOf(actionKeys[i]) === 0) {
            return true;
        }
    }
    return false;
}

function doAction (parent, actionStr, item) {
    var action = {
        todo:   parseAction(actionStr),
        parent: parent,
        item:   readLine(parent, item[actionStr])
    }, result;

    if (action.todo.type === 'repeat') {
        result = doRepeatAction(action);
    } else if(action.todo.type === 'random') {
        result = doRandomAction(action);
    } else {
        result = action.item;
    }

    return result;
}

function parseAction (actionStr) {
    var todo = actionStr.split(':');
    return todo.length === 2 ? {type: todo[0], val: ~~todo[1]} : {};
}

function doRepeatAction(action) {
    var res = [];
    for (var i = 0; i < action.todo.val; i++) {
        res.push(action.item);
    }
    return res;
}

function doRandomAction(action) {
    var res = [];
    for (var i = 0; i < action.todo.val; i++) {
        var itemIndex = ~~(Math.random() * action.item.length);
        res.push(action.item[itemIndex]);
        action.item.splice(itemIndex, 1);
    }
    return res;
}


function readObj (parent, obj) {
    var result = {};
    for (var key in obj) {
        if (isActionKey(key)) {
            result = doAction(parent, key, obj);
        } else {
            result[key] = readLine(key, obj[key]);
        }
    }

    return result;
}

function readAry (parent, ary) {
    var result = [];
    for (var i = 0; i < ary.length; i++){
        result.push(readLine(undefined, ary[i]));
    }
    return result;
}

function readStr (key, val) {
    return val;
}

function readNbr (key, val) {
    return val;
}

function readLine (key, val) {

    if (val instanceof Array) {
        return readAry(key, val);
    }
    if (val instanceof Object) {
        return readObj(key, val);
    }
    if (typeof val === 'string') {
        return readStr(key, val);
    }
    if (typeof val === 'number') {
        return readNbr(key, val);
    }
}


