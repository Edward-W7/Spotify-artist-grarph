// GraphElement.js

/**
 * Represents a basic graph element
 * @class
 */
export class GraphElement {
  /**
   * Creates a new GraphElement.
   * @param {string} id - The unique identifier of the graph element
   */
  constructor(id) {
    /**
     * The unique identifier of the graph element
     * @type {string}
     */
    this.id = id;

    /**
     * The type of the graph element ('node' or 'edge')
     * @type {string}
     */
    this.type = 'element';
  }

  /**
   * Gets the ID of the graph element
   * @returns {string} The ID of the graph element
   */
  getId() {
    return this.id;
  }

  /**
   * Gets the type of the graph element
   * @returns {string} The type of the graph element
   */
  getType() {
    return this.type;
  }

  /**
   * Describes the graph element
   * This method is intended to be overridden by child classes
   * @returns {string} A description of the graph element
   */
  describe() {
    return `GraphElement: ${this.formatId()}`;
  }

  /**
   * Private method to format the ID
   * @returns {string} The formatted ID
   */
  _formatId() {
    return `[ID: ${this.id}]`;
  }
}
