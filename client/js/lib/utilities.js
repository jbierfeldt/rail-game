// used in the Board class
function create2DArray(rows) {
  let arr = [];

  for (let i=0;i<rows;i++) {
    arr[i] = [];
    for (let j=0;j<rows;j++) {
      arr[i][j] = 0;
    }
  }

  return arr;
}

// random equal choice between
function choose(choices) {
  const index = Math.floor(Math.random() * choices.length);
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
  console.log("adding rule");
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRBG() {
  return [getRandomInt(75,256), getRandomInt(75,256), getRandomInt(0,256)];
}

function findMax(array)
{
  let max = 0;
  for (let counter = 0; counter < array.length; counter++)
  {
    if (array[counter] > max)
    {
      max = array[counter];
    }
  }
  return max;
}
