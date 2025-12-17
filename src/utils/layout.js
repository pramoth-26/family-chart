import dagre from 'dagre';
import { Position } from 'reactflow';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 120;
const SPACING_X = 50;
const SPACING_Y = 100;

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';

    // Increase separation to avoid overlaps
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: SPACING_Y,
        nodesep: SPACING_X
    });

    nodes.forEach((node) => {
        // Calculate dynamic dimensions based on node content (spouses)
        let spouseCount = 0;
        if (node.data.spouses && Array.isArray(node.data.spouses)) {
            spouseCount = node.data.spouses.length;
        } else if (node.data.spouse) {
            spouseCount = 1;
        }

        // Determine dimensions
        let width = CARD_WIDTH;
        let height = CARD_HEIGHT;

        if (spouseCount <= 1) {
            // Unified mode: Horizontal stacking of Primary + Spouse
            width = (1 + spouseCount) * CARD_WIDTH;
        } else {
            // Multi-spouse mode: Primary on top, Spouses row below
            // Width is determined by the wider of the two rows
            // Primary is 1 unit. Spouses row is spouseCount units.
            width = Math.max(1, spouseCount) * CARD_WIDTH + ((spouseCount - 1) * 20); // Add some inner gap buffer
            height = CARD_HEIGHT * 2.5; // Taller to accommodate two rows + gap
        }

        // Add extra padding to node bounds to be safe
        dagreGraph.setNode(node.id, { width: width, height: height });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // Shift anchor to top-left from center
        // Note: We use the *calculated* width/height from dagre for centering logic 
        // to ensure the node is placed where dagre 'thought' the center was.
        node.position = {
            x: nodeWithPosition.x - (nodeWithPosition.width / 2),
            y: nodeWithPosition.y - (nodeWithPosition.height / 2),
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};
