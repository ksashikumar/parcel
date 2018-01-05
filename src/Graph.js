const DijkstraGraph = require('node-dijkstra');

class Graph {
  constructor() {
    this.lower = new DijkstraGraph();
    this.higher = new DijkstraGraph();
    this.values = new Map();
    this.edges = new Map();
  }

  static getKids(route, name) {
    let kids = new Map();
    if (route.graph.has(name)) {
      route.graph.get(name).forEach((v, k) => kids.set(k, v));
    }
    return kids;
  }

  static addNode(route, name, children, twoWay) {
    for (let child of children) {
      let kids = Graph.getKids(route, name);
      kids.set(child, 1);
      route.addNode(name, kids);
    }
    if (twoWay) {
      for (let child of children) {
        Graph.addNode(route, child, [name]);
      }
    }
    return route;
  }

  static removeNode(route, name, children, twoWay) {
    for (let child of children) {
      let kids = Graph.getKids(route, name);
      if (kids.has(child)) {
        kids.delete(child);
      }
      route.addNode(name, kids);
    }
    if (twoWay) {
      for (let child of children) {
        Graph.addNode(route, child, [name]);
      }
    }
    return route;
  }

  static key(cache, leaf, args) {
    for (let arg of args) {
      if (!cache.has(arg)) {
        cache.set(arg, new Map());
      }
      cache = cache.get(arg);
    }
    if (!cache.has(leaf)) {
      cache.set(leaf, args);
    }
    return cache.get(leaf);
  }

  key() {
    let cache = (Graph._cache = Graph._cache || new Map());
    let leaf = (Graph._leaf = Graph._leaf || Symbol.for('Graph.leaf'));
    return Graph.key(cache, leaf, Array.prototype.slice.call(arguments, 0));
  }

  add(name, child, plist) {
    Graph.addNode(this.lower, name, [child]);
    Graph.addNode(this.higher, child, [name]);
    // console.log([this.key(name, child), edge]);
    this.edges.set(this.key(name, child), plist);
    return this;
  }

  remove(name, child) {
    Graph.removeNode(this.lower, name, [child]);
    Graph.removeNode(this.higher, child, [name]);
    // console.log(['remove', this.key(name, child)]);
    this.edges.delete(this.key(name, child));
    return this;
  }

  has(name) {
    return this.lower.graph.has(name);
  }

  get(name) {
    return this.values.get(name);
  }

  edge(name, child) {
    return this.edges.get(this.key(name, child));
  }

  set(name, value) {
    this.values.set(name, value);
    return this;
  }

  children(name) {
    let kids = Graph.getKids(this.lower, name);
    let l = new Map();
    kids.forEach((v, k) => l.set(k, this.edges.get(this.key(name, k))));
    return l;
  }

  parents(name) {
    let kids = Graph.getKids(this.higher, name);
    let l = new Map();
    kids.forEach((v, k) => l.set(k, this.edges.get(this.key(k, name))));
    return l;
  }

  pathDown(a, b, options = {}) {
    return this.lower.path(a, b, options) || [];
  }

  pathUp(a, b, options = {}) {
    return this.higher.path(a, b, options) || [];
  }
}

module.exports = Graph;
