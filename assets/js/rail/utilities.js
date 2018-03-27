// utility class to deal with inheritance
function inherit(cls, superCls) {
	// We use an intermediary empty constructor to create an
    // inheritance chain, because using the super class' constructor
    // might have side effects.
    var construct = function () {};
    construct.prototype = superCls.prototype;
    cls.prototype = new construct;
    cls.prototype.constructor = cls;
    cls.super = superCls;
}


// used in the Board class
function Create2DArray(rows) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = [];
     for (var j=0;j<rows;j++) {
	     arr[i][j] = 0;
     }
  }

  return arr;
}

// random equal choice between
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

// identical array 
function arrayIsIdent(arr) {
	return arr.every(function(v, i, a) {
		// first item: nothing to compare with (and, single element arrays should return true
		// otherwise:  compare current value to previous value
		return i === 0 || v === a[i - 1];
	});
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

var combinations = function (array)
{
    var result = [];

    var loop = function (start,depth,prefix)
    {
        for(var i=start; i<array.length; i++)
        {
            var next = prefix+array[i];
            if (depth > 0)
                loop(i+1,depth-1,next);
            else
                result.push(next);
        }
    }

    for(var i=0; i<array.length; i++)
    {
        loop(0,i,'');
    }

    return result;
}

function addCSSRule(sheet, selector, rules, index) {
	if("insertRule" in sheet) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
	else if("addRule" in sheet) {
		sheet.addRule(selector, rules, index);
	}
}

// Use it!
//addCSSRule(document.styleSheets[0], "header", "float: left");

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRBG() {
	return [getRandomInt(75,256), getRandomInt(75,256), getRandomInt(0,256)];
}
