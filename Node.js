// Node.js
// This is NOT using node.js, this is a js file for Nodes in the graph

import { GraphElement } from './GraphElement.js';

/**
 * Represents a node in the graph
 * @class
 * @extends GraphElement
 */
export class Node extends GraphElement {
  /**
   * Creates a new Node
   * @param {string} id - The unique identifier of the node
   */
  constructor(id) {
    super(id);
    this.type = 'node';

    /**
     * The x-coordinate position of the node
     * @type {number}
     */
    this.x = 0;

    /**
     * The y-coordinate position of the node
     * @type {number}
     */
    this.y = 0;

    /**
     * The fixed x-coordinate for dragging
     * @type {?number}
     */
    this.fx = null;

    /**
     * The fixed y-coordinate for dragging
     * @type {?number}
     */
    this.fy = null;

    /**
     * The radius of the node.
     * @type {number}
     */
    this.radius = 5;

    /**
     * The color of the node.
     * @type {string}
     */
    this.color = 'blue';
  }

  /**
   * Sets the position of the node
   * @param {number} x - The x-coordinate
   * @param {number} y - The y-coordinate
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Gets the current position of the node
   * @returns {{x: number, y: number}} The position of the node
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * Overrides the describe method from GraphElement
   * @returns {string} A description of the node
   */
  describe() {
    return `Node ${this._formatId()} at position (${this.x}, ${this.y})`;
  }

  /**
   * "Private" method to format the ID
   * Overrides the method in GraphElement
   * @returns {string} The formatted ID
   */
  _formatId() {
    return `<<${this.id}>>`;
  }

  /**
   * Handles the drag start event for the node
   * @param {object} event - The drag event
   * @param {object} simulation - The force simulation
   */
  dragstarted(event, simulation) {
    if (!event.active) simulation.alphaTarget(0.8).restart();
    this.fx = this.x;
    this.fy = this.y;
  }

  /**
   * Handles the dragging event for the node
   * @param {object} event - The drag event
   */
  dragged(event) {
    this.fx = event.x;
    this.fy = event.y;
  }

  /**
   * Handles the drag end event for the node
   * @param {object} event - The drag event
   * @param {object} simulation - The force simulation
   */
  dragended(event, simulation) {
    if (!event.active) simulation.alphaTarget(0);
    this.fx = null;
    this.fy = null;
  }
}
