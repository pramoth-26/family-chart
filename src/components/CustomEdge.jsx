import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';
import { X } from 'lucide-react';
import './CustomEdge.css';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}) {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (evt) => {
        evt.stopPropagation();
        // Confim deletion
        if (window.confirm('Do you want to remove this connection?')) {
            setEdges((edges) => edges.filter((edge) => edge.id !== id));
        }
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                    className="nopan"
                >
                    <button
                        className="edgebutton-delete"
                        onClick={onEdgeClick}
                        title="Remove Connection"
                    >
                        <X size={10} />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
