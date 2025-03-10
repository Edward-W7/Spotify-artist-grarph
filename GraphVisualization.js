// GraphVisualization.js

import { Node } from './Node.js';
import { Edge } from './Edge.js';

/**
 * Main script for visualizing the graph using D3.js.
 * This script sets up the SVG canvas, processes data, creates nodes and edges,
 * and handles the force simulation and rendering.
 */

const width = 3000;
const height = 2000;

const svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height);

const container = svg.append('g');

// Load the graph data from JSON
d3.json('graphData.json').then(data => {
  //Array of node data from the JSON file.

  let nodesData = data.nodes;

  //Array of link (edge) data from the JSON file.

  let linksData = data.edges;

  // Minimum weight for edges
  const minEdgeWeight = 400;

  // Filter the edges based on minimum weight
  let filteredLinksData = linksData.filter(d => d.weight >= minEdgeWeight);

  // Build a set of connected node IDs
  const connectedNodeIds = new Set();
  filteredLinksData.forEach(link => {
    connectedNodeIds.add(link.source);
    connectedNodeIds.add(link.target);
  });

  // Filter nodes based on connected node IDs
  let filteredNodesData = nodesData.filter(d => connectedNodeIds.has(d.id));

  // Create Node objects and store them in a map for quick lookup
  const nodeById = new Map();
  filteredNodesData.forEach(nodeData => {
    const node = new Node(nodeData.id);
    nodeById.set(nodeData.id, node);
  });

  // Create Edge objects
  const edges = [];
  filteredLinksData.forEach(linkData => {
    const sourceNode = nodeById.get(linkData.source);
    const targetNode = nodeById.get(linkData.target);
    const edge = new Edge(`${linkData.source}-${linkData.target}`, sourceNode, targetNode, linkData.weight);
    edges.push(edge);
  });

  // Array of Node objects
  const nodes = Array.from(nodeById.values());

  // Output descriptions for testing method overriding
  console.log(nodes[0].describe()); // Should use Node's describe method
  console.log(edges[0].describe()); // Should use Edge's describe method

  // Degree map to store the number of connections for each node
  const degreeMap = {};
  edges.forEach(edge => {
    degreeMap[edge.source.id] = (degreeMap[edge.source.id] || 0) + 1;
    degreeMap[edge.target.id] = (degreeMap[edge.target.id] || 0) + 1;
  });

  // Calculate total weight passing through each node
  const totalWeightMap = {};
  edges.forEach(edge => {
    totalWeightMap[edge.source.id] = (totalWeightMap[edge.source.id] || 0) + edge.weight;
    totalWeightMap[edge.target.id] = (totalWeightMap[edge.target.id] || 0) + edge.weight;
  });

  // Prepare data for node color scale
  const totalWeights = Object.values(totalWeightMap);
  const minTotalWeight = d3.min(totalWeights);
  const maxTotalWeight = d3.max(totalWeights);

  // Create a color scale for nodes based on total weight
  const nodeColorScale = d3.scaleSequential(d3.interpolateRgbBasis(["rgb(126,168,255)", "rgb(127,243,43)", "rgb(255,253,97)"]))
    .domain([Math.sqrt(minTotalWeight), Math.sqrt(maxTotalWeight)]);

  // Log scale for node size based on degree
  const degrees = nodes.map(node => (degreeMap[node.id] || 0) + 1); // Add 1 to avoid zero degrees

  // Find the minimum and maximum degrees
  const minDegree = d3.min(degrees);
  const maxDegree = d3.max(degrees);

  const minRadius = 5;  // Minimum circle radius
  const maxRadius = 30; // Maximum circle radius

  // Create a logarithmic scale for node radii
  const radiusScale = d3.scaleLog()
    .domain([minDegree, maxDegree])
    .range([minRadius, maxRadius]);

  // Max and min weights for edges
  const maxWeight = d3.max(edges, edge => edge.weight);
  const minWeight = d3.min(edges, edge => edge.weight);

  // Create a color scale for edges based on weight
  const edgeColorScale = d3.scaleSequential(d3.interpolateRgb("rgb(176,209,249)", "rgb(135,234,75)"))
    .domain([Math.sqrt(minWeight), Math.sqrt(4500)]);

  // Define desired maximum stroke width for edges
  const desiredMaxStrokeWidth = 10;
  const weightScaleFactor = desiredMaxStrokeWidth / maxWeight;

  // Scale for distance between nodes based on edge weight
  const minLinkDistance = 50;  // Shortest distance for strongest link
  const maxLinkDistance = 200; // Longest distance for weakest link

  const linkDistanceScale = d3.scaleLinear()
    .domain([minWeight, maxWeight])
    .range([maxLinkDistance, minLinkDistance]); // Inverted so higher weight gives shorter distance

  // Set up the force simulation
  const simulation = d3.forceSimulation(nodes)
    .alphaDecay(0.01) // Faster decay to speed up stabilization
    //.alphaMin(0.03)   // Stop the simulation earlier
    .force('link', d3.forceLink(edges)
      .id(d => d.id)
      .distance(d => linkDistanceScale(d.weight))
    )
    .force('charge', d3.forceManyBody()
      .strength(-1000) // Increase repulsion to space nodes out more
      .distanceMin(20)
      .distanceMax(1000))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked); // Call the ticked function on each simulation tick

  // Zoom functionality
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on('zoom', zoomed);

  svg.call(zoom);

  /**
   * Handles the zoom event.
   * @param {object} transform - The transformation applied during zoom.
   */
  function zoomed({ transform }) {
    container.attr('transform', transform);
  }

  // Add links (edges) to the SVG
  const link = container.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(edges)
    .enter().append('line')
    .attr('stroke-width', d => d.weight * weightScaleFactor * 2)
    .attr('stroke', d => edgeColorScale(Math.sqrt(d.weight)))
    .attr('stroke-opacity', d => ((d.weight / 3000) - 0.1));

  // Compute the strongest connection for each node
  const strongestConnectionMap = {};
  nodes.forEach(node => {
    strongestConnectionMap[node.id] = {
      maxWeight: 0,
      neighborId: null
    };
  });

  edges.forEach(edge => {
    const sourceId = edge.source.id;
    const targetId = edge.target.id;
    const weight = edge.weight;

    // For source node
    if (weight > strongestConnectionMap[sourceId].maxWeight) {
      strongestConnectionMap[sourceId].maxWeight = weight;
      strongestConnectionMap[sourceId].neighborId = targetId;
    }

    // For target node
    if (weight > strongestConnectionMap[targetId].maxWeight) {
      strongestConnectionMap[targetId].maxWeight = weight;
      strongestConnectionMap[targetId].neighborId = sourceId;
    }
  });

  // Add nodes to the SVG
  const nodeGroup = container.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter().append('g')
    .call(drag(simulation));

  nodeGroup.append('circle')
    .attr('r', d => {
      const radius = radiusScale((degreeMap[d.id] || 0) + 1);
      d.radius = radius; // Store radius in node data
      return radius;
    })
    .attr('fill', d => nodeColorScale(Math.sqrt(totalWeightMap[d.id])))


  nodeGroup.append('title')
    .text(d => d.id);

  nodeGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .text(d => d.id)
    .style('font-size', d => (d.radius * 0.5) + 'px')
    .style('pointer-events', 'none'); // So text doesn't interfere with mouse events

  // Tooltip for displaying node information
  const tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .style('display', 'none')
    .style('position', 'absolute')
    .style('background', 'lightgray')
    .style('padding', '5px')
    .style('border-radius', '5px');

  // Event listeners for node interactions
  nodeGroup.on('mouseover', (event, d) => {
    const totalConnections = degreeMap[d.id] || 0;
    const strongestConnection = strongestConnectionMap[d.id].neighborId;
    const maxWeight = strongestConnectionMap[d.id].maxWeight;
    const totalWeight = totalWeightMap[d.id] || 0;

    let tooltipContent = `<strong>${d.id}</strong><br>`;
    tooltipContent += `Total Connections: ${totalConnections}<br>`;
    tooltipContent += `Total Weight: ${totalWeight}<br>`;
    if (strongestConnection) {
      tooltipContent += `Strongest Connection: ${strongestConnection} (Weight: ${maxWeight})`;
    } else {
      tooltipContent += `No Connections`;
    }

    tooltip.style('display', 'inline-block')
      .html(tooltipContent)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 20) + 'px');
  })
    .on('mousemove', (event) => {
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 20) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('display', 'none');
    });

  /**
   * Updates the positions of nodes and edges on each tick of the simulation
   */
  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    nodeGroup
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }

  /**
   * Sets up the drag behavior for nodes
   * @param {object} simulation - The force simulation
   * @returns {object} The drag behavior
   */
  function drag(simulation) {
    return d3.drag()
      .on('start', (event, d) => d.dragstarted(event, simulation))
      .on('drag', (event, d) => d.dragged(event))
      .on('end', (event, d) => d.dragended(event, simulation));
  }
});
