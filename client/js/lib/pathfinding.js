const getDijkstraTree = function(path, startId) {
  // build a tree of costs and parents from startId
  // to every other node on the path

  // create initial objects and lists
  const costs = {};
  const parents = {};
  const processed = [];

  // set start cost = 0
  costs[startId] = 0;

  // set tentative cost for all other nodes to Infinity
  for (let i = 0; i < path.length; i++) {
    if (path[i].id != startId) {
      costs[path[i].id] = Infinity;
    }
  }

  // currentNode = start node
  let currentNode = getLowestNode(costs, processed);

  // as long as there are nodes which are not in processed...
  while (currentNode) {
    let cost = costs[currentNode]; // cost of current node
    let children = getNodeById(path, currentNode).neighbors;
    let childrenCosts = getCostsOfNeighbors(path, children); // 1 or 1001

    for (let n in childrenCosts) {
      let newCost = cost + childrenCosts[n]; // cost of current node + travel
      if (costs[n] > newCost) {
        costs[n] = newCost;
        parents[n] = currentNode;
      }
    }

    // add currentNode to processed list after processing
    processed.push(currentNode);

    // get lowest, unprocessed node
    currentNode = getLowestNode(costs, processed);
  }

  // return path, costs, and parents for use with getOptimalPathFromTree
  return {path, costs, parents};
};

const getOptimalPathFromTree = function(tree, finishId) {

  // return array of actual nodes on the optimal path
  let optimalPath = [getNodeById(tree.path,finishId)];
  let parent = tree.parents[finishId];
  while (parent) {
    optimalPath.push(getNodeById(tree.path,parent));
    parent = tree.parents[parent];
  }
  optimalPath.reverse();

  // return int of the target Score
  // used to check validity. if >2000,
  // then invalid
  const targetScore = tree.costs[finishId];

  return {optimalPath, targetScore};
};

const getLowestNode = function(costs, processed) {
  return Object.keys(costs).reduce((lowest, node) => {
    if (lowest === null || costs[node] < costs[lowest]) {
      if (!processed.includes(node) && costs[node] < 1000) { // costs[node] just makes it more efficient;
        lowest = node;
      }
    }
    return lowest;
  }, null);
};

const getNodeById = function(path, id) {
  for (let i = 0; i < path.length; i++) {
    if (path[i].id == id) return path[i];
  }
}

const getCostsOfNeighbors = function(path, neighbors) {
  const costs = {};
  for (let i = 0; i < neighbors.length; i++) {
    if (getNodeById(path, neighbors[i]).type) {
      costs[neighbors[i]] = 1001;
    } else {
      costs[neighbors[i]] = 1;
    }
  }
  return costs;
}
