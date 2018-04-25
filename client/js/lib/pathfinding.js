const getDijkstraTree = function(path, startId) {
  
  let start = getNodeById(path, startId);
  const costs = getCostsOfNeighbors(path, start.neighbors);
  costs[start.id] = -1;
  const parents = {};
  const processed = [String(start.id)];

  for (let i = 0; i < start.neighbors.length; i++) {
    parents[start.neighbors[i]] = start.id;
  }

  let node = getLowestNode(costs, processed);
  while (node) {
    let cost = costs[node];
    let children = getNodeById(path, node).neighbors;
    let childrenCosts = getCostsOfNeighbors(path, children);

    for (let n in childrenCosts) {
      let newCost = cost + childrenCosts[n];
      if (!costs[n]) {
        costs[n] = newCost;
        parents[n] = Number(node);
      }
      if (costs[n] > newCost) {
        costs[n] = newCost;
        parents[n] = Number(node);
      }
    }

    processed.push(node);
    node = getLowestNode(costs, processed);
  }

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
}

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

const getLowestNode = function(costs, processed) {
  return Object.keys(costs).reduce((lowest, node) => {
    if (lowest === null || costs[node] < costs[lowest]) {
      if (!processed.includes(node)) {
        lowest = node;
      }
    }
    return lowest;
  }, null);
};
