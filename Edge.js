// Edge.js

import { GraphElement } from './GraphElement.js';
import { Node } from './Node.js';

/**
 * Represents an edge (link) between two nodes in the graph.
 * @class
 * @extends GraphElement
 */
export class Edge extends GraphElement {
  /**
   * Creates a new Edge.
   * @param {string} id - The unique identifier of the edge.
   * @param {Node} source - The source node.
   * @param {Node} target - The target node.
   * @param {number} [weight=1] - The weight of the edge.
   */
  constructor(id, source, target, weight = 1) {
    super(id);
    this.type = 'edge';

    /**
     * The source node of the edge.
     * @type {Node}
     */
    this.source = source;

    /**
     * The target node of the edge.
     * @type {Node}
     */
    this.target = target;

    /**
     * The weight of the edge.
     * @type {number}
     */
    this.weight = weight;
  }

  /**
   * Gets the source node of the edge.
   * @returns {Node} The source node.
   */
  getSource() {
    return this.source;
  }

  /**
   * Gets the target node of the edge.
   * @returns {Node} The target node.
   */
  getTarget() {
    return this.target;
  }

  /**
   * Gets the weight of the edge.
   * @returns {number} The weight of the edge.
   */
  getWeight() {
    return this.weight;
  }

  /**
   * Overrides the describe method from GraphElement.
   * @returns {string} A description of the edge.
   */
  describe() {
    return `Edge ${this._formatId()} connects ${this.source.id} and ${this.target.id} with weight ${this.weight}`;
  }

  /**
   * "Private" method to format the ID.
   * @returns {string} The formatted ID.
   */
  _formatId() {
    return `{${this.id}}`;
  }
}
