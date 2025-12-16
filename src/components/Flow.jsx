import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
    addEdge,
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
    getRectOfNodes,
    getTransformForBounds
} from 'reactflow';
import { Menu, X, Trash2 } from 'lucide-react';
import 'reactflow/dist/style.css';
import './Flow.css';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import Modal from './Modal';
import { getLayoutedElements } from '../utils/layout';

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

const Flow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView, getNodes } = useReactFlow();

    const [isModalOpen, setIsModalOpen] = useState(false);
    // { type: 'ROOT' | 'SPOUSE' | 'CHILD' | 'EDIT', nodeId: string, memberType: 'PRIMARY' | 'SPOUSE' }
    const [modalContext, setModalContext] = useState(null);
    const [modalInitialValues, setModalInitialValues] = useState(null);

    // Responsive State
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

    // Multiple Families State
    const [families, setFamilies] = useState([]);
    const [currentFamilyId, setCurrentFamilyId] = useState(null);
    const [newFamilyName, setNewFamilyName] = useState('');
    const [isCreatingFamily, setIsCreatingFamily] = useState(false);

    // Local Data Logic
    const LOCAL_STORAGE_KEY = 'family_tree_data';

    const getFamiliesFromStorage = () => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to parse local storage", e);
            return [];
        }
    };

    const saveFamiliesToStorage = (familiesData) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(familiesData));
    };

    // Fetch families list on mount
    useEffect(() => {
        const storedFamilies = getFamiliesFromStorage();
        setFamilies(storedFamilies);
        if (storedFamilies.length > 0 && !currentFamilyId) {
            loadFamily(storedFamilies[0].id);
        }
    }, []);

    const loadFamily = (id) => {
        const storedFamilies = getFamiliesFromStorage();
        const family = storedFamilies.find(f => f.id === id);
        if (family) {
            setCurrentFamilyId(id);
            setNodes(family.nodes || []);
            // Ensure loaded edges have visibility style
            const loadedEdges = (family.edges || []).map(edge => ({
                ...edge,
                style: { stroke: '#fff', strokeWidth: 2, ...edge.style }
            }));
            setEdges(loadedEdges);
            setTimeout(() => fitView({ padding: 0.2 }), 50);

            // Close panels on mobile after selection
            if (window.innerWidth < 768) {
                setIsLeftPanelOpen(false);
            }
        } else {
            alert("Family not found");
        }
    };

    const createFamily = () => {
        if (!newFamilyName.trim()) {
            alert("Please enter a family name");
            return;
        }

        const newFamily = {
            id: Math.random().toString(36).substr(2, 9),
            name: newFamilyName,
            nodes: [
                {
                    id: '1',
                    type: 'custom',
                    data: { label: 'Root Member', gender: 'male' },
                    position: { x: 0, y: 0 },
                }
            ],
            edges: []
        };

        const storedFamilies = getFamiliesFromStorage();
        const updatedFamilies = [...storedFamilies, newFamily];
        saveFamiliesToStorage(updatedFamilies);

        setFamilies(updatedFamilies);
        setCurrentFamilyId(newFamily.id);
        setNodes(newFamily.nodes);
        setEdges(newFamily.edges);
        setNewFamilyName('');
        setIsCreatingFamily(false);
        setNewFamilyName('');
        setIsCreatingFamily(false);
    };

    const deleteFamily = (e, familyId) => {
        e.stopPropagation(); // Prevent loading the family when clicking delete
        if (!window.confirm("Are you sure you want to delete this ENTIRE family tree? This cannot be undone.")) {
            return;
        }

        const updatedFamilies = families.filter(f => f.id !== familyId);
        saveFamiliesToStorage(updatedFamilies);
        setFamilies(updatedFamilies);

        // If we deleted the current family, switch to another or clear
        if (currentFamilyId === familyId) {
            if (updatedFamilies.length > 0) {
                loadFamily(updatedFamilies[0].id);
            } else {
                setCurrentFamilyId(null);
                setNodes([]);
                setEdges([]);
            }
        }
    };

    const saveTree = () => {
        if (!currentFamilyId) {
            alert("No family selected!");
            return;
        }

        try {
            const storedFamilies = getFamiliesFromStorage();
            const updatedFamilies = storedFamilies.map(fam => {
                if (fam.id === currentFamilyId) {
                    return { ...fam, nodes, edges };
                }
                return fam;
            });

            saveFamiliesToStorage(updatedFamilies);
            alert("Family Tree Saved Locally!");
        } catch (error) {
            console.error("Error saving tree:", error);
            alert("Error saving tree.");
        }
    };

    // Auto-save logic
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    const currentFamilyIdRef = useRef(currentFamilyId);

    useEffect(() => {
        nodesRef.current = nodes;
        edgesRef.current = edges;
        currentFamilyIdRef.current = currentFamilyId;
    }, [nodes, edges, currentFamilyId]);

    useEffect(() => {
        const interval = setInterval(() => {
            const familyId = currentFamilyIdRef.current;
            if (!familyId) return;

            try {
                const storedFamilies = getFamiliesFromStorage();
                const updatedFamilies = storedFamilies.map(fam => {
                    if (fam.id === familyId) {
                        return { ...fam, nodes: nodesRef.current, edges: edgesRef.current };
                    }
                    return fam;
                });

                saveFamiliesToStorage(updatedFamilies);
                console.log(`Auto-saved family: ${familyId} at ${new Date().toLocaleTimeString()}`);
            } catch (error) {
                console.error("Auto-save failed:", error);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge({ ...params, type: 'custom', animated: true, style: { stroke: '#fff', strokeWidth: 2 } }, eds)
            ),
        [setEdges]
    );

    const onLayout = useCallback(
        (direction) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges,
                direction
            );

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
            setTimeout(() => fitView({ padding: 0.2 }), 50);

            if (window.innerWidth < 768) {
                setIsRightPanelOpen(false);
            }
        },
        [nodes, edges, setNodes, setEdges, fitView]
    );

    // Actions triggered from Node
    const onAddSpouse = useCallback((nodeId) => {
        setModalContext({ type: 'SPOUSE', nodeId });
        setModalInitialValues(null);
        setIsModalOpen(true);
    }, []);

    const onAddChild = useCallback((nodeId, handleId = 'primary') => {
        setModalContext({ type: 'CHILD', nodeId, handleId });
        setModalInitialValues(null);
        setIsModalOpen(true);
    }, []);

    const onEdit = useCallback((nodeId, memberType, index) => {
        setNodes((currentNodes) => {
            const node = currentNodes.find(n => n.id === nodeId);
            if (node) {
                // Compatibility check
                let spouses = node.data.spouses || (node.data.spouse ? [node.data.spouse] : []);

                let values = {};
                if (memberType === 'PRIMARY') {
                    values = {
                        name: node.data.label,
                        nickname: node.data.nickname, // New
                        gender: node.data.gender,
                        mobile: node.data.mobile,
                        childIndex: node.data.childIndex,
                        photo: node.data.photo // New
                    };
                } else if (memberType === 'SPOUSE' && spouses[index]) {
                    values = {
                        name: spouses[index].name,
                        nickname: spouses[index].nickname, // New
                        gender: spouses[index].gender,
                        mobile: spouses[index].mobile,
                        childIndex: spouses[index].childIndex,
                        photo: spouses[index].photo // New
                    };
                }

                setModalInitialValues(values);
                setModalContext({ type: 'EDIT', nodeId, memberType, index });
                setIsModalOpen(true);
            }
            return currentNodes;
        });
    }, [setNodes]);

    const onDelete = useCallback((nodeId, memberType, index) => {
        if (!window.confirm("Are you sure you want to delete this person?")) return;

        setNodes((currentNodes) => {
            if (memberType === 'PRIMARY') {
                return currentNodes.filter(n => n.id !== nodeId);
            } else {
                return currentNodes.map(node => {
                    if (node.id === nodeId) {
                        let spouses = node.data.spouses || (node.data.spouse ? [node.data.spouse] : []);

                        // Remove specific spouse by index
                        if (index >= 0 && index < spouses.length) {
                            const newSpouses = [...spouses];
                            newSpouses.splice(index, 1);

                            const newData = { ...node.data, spouses: newSpouses };
                            // Cleanup legacy single spouse
                            delete newData.spouse;
                            return { ...node, data: newData };
                        }
                    }
                    return node;
                });
            }
        });
    }, [setNodes]);

    const openRootModal = () => {
        setModalContext({ type: 'ROOT' });
        setModalInitialValues(null);
        setIsModalOpen(true);
    }

    const downloadImage = () => {
        const nodesBounds = getRectOfNodes(getNodes());
        const imageWidth = nodesBounds.width;
        const imageHeight = nodesBounds.height;
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        const viewport = document.querySelector('.react-flow__viewport');

        if (viewport) {
            toPng(viewport, {
                backgroundColor: '#0f1115', // Matches app bg
                width: imageWidth * 2,  // Basic scaling if needed, or rely on transform
                height: imageHeight * 2,
                style: {
                    width: imageWidth,
                    height: imageHeight,
                    transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
                },
                filter: (node) => {
                    // Exclude UI controls from download
                    if (node.classList) {
                        return !node.classList.contains('edgebutton-delete') &&
                            !node.classList.contains('node-actions') &&
                            !node.classList.contains('person-actions') &&
                            !node.classList.contains('react-flow__minimap') &&
                            !node.classList.contains('react-flow__controls');
                    }
                    return true;
                }
            }).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'family-tree.png';
                link.href = dataUrl;
                link.click();
            });
        }
    };

    const downloadPDF = () => {
        const nodesBounds = getRectOfNodes(getNodes());
        const imageWidth = nodesBounds.width;
        const imageHeight = nodesBounds.height;
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        const viewport = document.querySelector('.react-flow__viewport');

        if (viewport) {
            // Dynamic scaling to prevent browser crash on large charts
            let pixelRatio = 3;
            if (imageWidth > 2500 || imageHeight > 2500) pixelRatio = 2;
            if (imageWidth > 5000 || imageHeight > 5000) pixelRatio = 1;

            // Warn if extremely large
            if (imageWidth > 10000 || imageHeight > 10000) {
                console.warn("Chart is extremely large, download might fail due to browser memory limits.");
            }

            toPng(viewport, {
                backgroundColor: '#0f1115', // Keep dark theme background
                width: imageWidth, // Use 1:1 dimensions to avoid double scaling
                height: imageHeight,
                style: {
                    width: imageWidth,
                    height: imageHeight,
                    transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
                },
                pixelRatio: pixelRatio, // Adjusted based on size
                filter: (node) => {
                    // Exclude UI controls from download
                    if (node.classList) {
                        return !node.classList.contains('edgebutton-delete') &&
                            !node.classList.contains('node-actions') &&
                            !node.classList.contains('person-actions') &&
                            !node.classList.contains('react-flow__minimap') &&
                            !node.classList.contains('react-flow__controls');
                    }
                    return true;
                }
            }).then((dataUrl) => {
                const pdf = new jsPDF({
                    orientation: imageWidth > imageHeight ? 'l' : 'p',
                    unit: 'px',
                    format: [imageWidth + 100, imageHeight + 100] // Add some margin to page size
                });

                // Add image to PDF (centered with margin)
                pdf.addImage(dataUrl, 'PNG', 50, 50, imageWidth, imageHeight);
                pdf.save('family-tree.pdf');
            }).catch((error) => {
                console.error("PDF generation failed:", error);
                alert("Could not generate PDF. The chart is too large for the browser to render.");
            });
        }
    };

    // Inject callbacks into node data
    const nodesWithHandlers = nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onAddSpouse,
            onAddChild,
            onEdit,
            onDelete
        }
    }));

    const handleSaveMember = ({ name, nickname, gender, mobile, childIndex, photo }) => {
        console.log("Saving member:", name, gender, modalContext);
        if (!modalContext) return;

        if (modalContext.type === 'ROOT') {
            const newNode = {
                id: Math.random().toString(),
                type: 'custom',
                data: { label: name, nickname, gender, mobile, childIndex, photo, spouses: [] }, // Init empty array
                position: { x: Math.random() * 400, y: Math.random() * 400 },
            };
            setNodes((nds) => nds.concat(newNode));
        }
        else if (modalContext.type === 'SPOUSE') {
            setNodes((nds) => nds.map(node => {
                if (node.id === modalContext.nodeId) {
                    const currentSpouses = node.data.spouses || (node.data.spouse ? [node.data.spouse] : []);
                    const newSpouses = [...currentSpouses, { name, nickname, gender, mobile, childIndex, photo }];

                    const newData = { ...node.data, spouses: newSpouses };
                    delete newData.spouse; // Ensure legacy is cleaned

                    return { ...node, data: newData };
                }
                return node;
            }));
        }
        else if (modalContext.type === 'CHILD') {
            const newNodeId = Math.random().toString();
            const newNode = {
                id: newNodeId,
                type: 'custom',
                data: { label: name, nickname, gender, mobile, childIndex, photo, spouses: [] },
                position: { x: Math.random() * 400, y: Math.random() * 400 },
            };

            const newEdge = {
                id: `e${modalContext.nodeId}-${newNodeId}`,
                source: modalContext.nodeId,
                target: newNodeId,
                sourceHandle: modalContext.handleId || 'primary',
                type: 'custom',
                animated: true,
                style: { stroke: '#fff', strokeWidth: 2 }, // Explicit style for visibility
            };

            setNodes((nds) => nds.concat(newNode));
            setEdges((eds) => eds.concat(newEdge));
        }
        else if (modalContext.type === 'EDIT') {
            setNodes((nds) => nds.map(node => {
                if (node.id === modalContext.nodeId) {
                    const newData = { ...node.data };
                    if (modalContext.memberType === 'PRIMARY') {
                        newData.label = name;
                        newData.nickname = nickname;
                        newData.gender = gender;
                        newData.mobile = mobile;
                        newData.childIndex = childIndex;
                        newData.photo = photo;
                    } else {
                        // Edit specific spouse
                        let spouses = newData.spouses || (newData.spouse ? [newData.spouse] : []);
                        if (modalContext.index >= 0 && modalContext.index < spouses.length) {
                            spouses = [...spouses]; // Copy array
                            spouses[modalContext.index] = { ...spouses[modalContext.index], name, nickname, gender, mobile, childIndex, photo }; // Update item
                            newData.spouses = spouses;
                            delete newData.spouse;
                        }
                    }
                    return { ...node, data: newData };
                }
                return node;
            }));
        }
    };

    const getModalTitle = () => {
        if (!modalContext) return 'Add Member';
        switch (modalContext.type) {
            case 'SPOUSE': return 'Add Spouse';
            case 'CHILD': return 'Add Child';
            case 'EDIT': return 'Edit Member';
            default: return 'Add Family Member';
        }
    }

    return (
        <div className="flow-container" style={{ width: '100%', height: '100vh' }}>
            {/* Mobile Toggle Buttons */}
            <button className="mobile-toggle left" onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}>
                {isLeftPanelOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button className="mobile-toggle right" onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}>
                {isRightPanelOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar for Family Management */}
            <div className={`controls-sidebar left-sidebar ${isLeftPanelOpen ? 'open' : ''}`}>
                <h3>My Families (Local)</h3>
                <div className="control-group">
                    {isCreatingFamily ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <input
                                type="text"
                                placeholder="Family Name"
                                value={newFamilyName}
                                onChange={e => setNewFamilyName(e.target.value)}
                                style={{
                                    padding: 8,
                                    borderRadius: 6,
                                    border: '1px solid #333',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white'
                                }}
                            />
                            <div style={{ display: 'flex', gap: 5 }}>
                                <button onClick={createFamily} className="btn-primary-small" style={{ flex: 1 }}>Create</button>
                                <button onClick={() => setIsCreatingFamily(false)} className="btn-cancel" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button className="btn-primary-action" onClick={() => setIsCreatingFamily(true)}>
                            + New Family
                        </button>
                    )}
                </div>

                <div className="family-list" style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {families.map(fam => (
                        <div key={fam.id} style={{ display: 'flex', gap: 5 }}>
                            <button
                                onClick={() => loadFamily(fam.id)}
                                style={{
                                    background: currentFamilyId === fam.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                    textAlign: 'left',
                                    padding: '10px',
                                    flex: 1,
                                    border: currentFamilyId === fam.id ? '1px solid var(--color-primary-glow)' : '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {fam.name}
                            </button>
                            <button
                                onClick={(e) => deleteFamily(e, fam.id)}
                                className="btn-cancel"
                                style={{
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                                title="Delete Family"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {families.length === 0 && <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>No families stored locally.</p>}
                </div>
            </div>

            <ReactFlow
                nodes={nodesWithHandlers}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        return node.data.gender === 'female' ? '#ec4899' : '#3b82f6';
                    }}
                    style={{ background: '#181b21' }}
                />
            </ReactFlow>

            <div className={`controls-sidebar right-sidebar ${isRightPanelOpen ? 'open' : ''}`}>
                <h3>Tree Controls</h3>
                <div className="control-group">
                    <button className="btn-primary-action" onClick={openRootModal}>
                        + Add New Root
                    </button>
                </div>

                <div className="layout-group">
                    <button className="btn-secondary" onClick={() => onLayout('TB')}>
                        Vertical Layout
                    </button>
                    <button className="btn-secondary" onClick={() => onLayout('LR')}>
                        Horizontal Layout
                    </button>
                </div>

                <div className="layout-group" style={{ marginTop: '20px' }}>
                    <button className="btn-primary-action" style={{ background: 'var(--color-secondary)' }} onClick={saveTree}>
                        Save to Browser
                    </button>
                    <button className="btn-primary-action" style={{ background: 'var(--color-primary)', marginTop: '10px' }} onClick={downloadImage}>
                        Download PNG
                    </button>
                    <button className="btn-primary-action" style={{ background: '#ef4444', marginTop: '10px' }} onClick={downloadPDF}>
                        Download PDF (High Res)
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMember}
                title={getModalTitle()}
                initialValues={modalInitialValues}
            />
        </div>
    );
};

export default () => (
    <ReactFlowProvider>
        <Flow />
    </ReactFlowProvider>
);
