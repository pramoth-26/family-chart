import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Heart, Plus, Pencil, Trash2, Phone, Hash } from 'lucide-react';
import './CustomNode.css';

export default memo(({ data, id, isConnectable }) => {
    // Normalize spouses: check for new array format, fallback to legacy object, or empty array
    let spouses = [];
    if (data.spouses && Array.isArray(data.spouses)) {
        spouses = data.spouses;
    } else if (data.spouse) {
        spouses = [data.spouse];
    }

    const hasSpouse = spouses.length > 0;
    const isMultiSpouse = spouses.length > 1;

    // --- RENDER HELPERS ---

    // 1. Unified Layout (Single Grid) - For 0 or 1 Spouse
    if (!isMultiSpouse) {
        const spouse = spouses[0]; // Might be undefined

        return (
            <div className="custom-node-wrapper unified-mode">
                <Handle type="target" position={Position.Top} className="handle-target" isConnectable={isConnectable} />

                <div className="node-body">
                    {/* Husband */}
                    <div className={`person-section ${data.gender}`}>
                        <div className="icon-wrapper">
                            {data.photo ? <img src={data.photo} alt="Profile" className="profile-photo" /> : <User size={16} />}
                        </div>
                        <div className="person-info">
                            <div className="person-name">
                                {data.label}
                                {data.nickname && <span className="nickname"> ({data.nickname})</span>}
                            </div>
                            {data.mobile && <div className="person-meta"><Phone size={8} /> {data.mobile}</div>}
                            {data.childIndex && <div className="child-badge"><Hash size={8} /> {data.childIndex}</div>}
                        </div>
                        <div className="person-actions">
                            <button className="mini-btn edit-btn" onClick={(e) => { e.stopPropagation(); data.onEdit(id, 'PRIMARY'); }}>
                                <Pencil size={10} />
                            </button>
                            <button className="mini-btn delete-btn" onClick={(e) => { e.stopPropagation(); data.onDelete(id, 'PRIMARY'); }}>
                                <Trash2 size={10} />
                            </button>
                        </div>
                    </div>

                    {/* Divider if spouse exists */}
                    {spouse && (
                        <div className="couple-divider">
                            <Heart size={12} fill="#ff4b4b" stroke="none" />
                        </div>
                    )}

                    {/* Wife */}
                    {spouse && (
                        <div className={`person-section ${spouse.gender || 'female'}`}>
                            <div className="icon-wrapper">
                                {spouse.photo ? <img src={spouse.photo} alt="Profile" className="profile-photo" /> : <User size={16} />}
                            </div>
                            <div className="person-info">
                                <div className="person-name">
                                    {spouse.name}
                                    {spouse.nickname && <span className="nickname"> ({spouse.nickname})</span>}
                                </div>
                                {spouse.mobile && <div className="person-meta"><Phone size={8} /> {spouse.mobile}</div>}
                                {spouse.childIndex && <div className="child-badge"><Hash size={8} /> {spouse.childIndex}</div>}
                            </div>
                            <div className="person-actions">
                                <button className="mini-btn edit-btn" onClick={(e) => { e.stopPropagation(); data.onEdit(id, 'SPOUSE', 0); }}>
                                    <Pencil size={10} />
                                </button>
                                <button className="mini-btn delete-btn" onClick={(e) => { e.stopPropagation(); data.onDelete(id, 'SPOUSE', 0); }}>
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions Bar */}
                <div className="node-actions">
                    <button className="action-btn spouse-btn" onClick={(e) => { e.stopPropagation(); data.onAddSpouse(id); }} title="Add Spouse">
                        <Heart size={12} />
                    </button>
                    {hasSpouse && (
                        <button className="action-btn child-btn" onClick={(e) => { e.stopPropagation(); data.onAddChild(id, 'primary'); }} title="Add Child">
                            <Plus size={14} />
                        </button>
                    )}
                </div>

                {/* Single Source Handle for the whole couple */}
                <Handle type="source" position={Position.Bottom} id="primary" className="handle-source" isConnectable={isConnectable} />
            </div>
        );
    }

    // 2. Tree Layout (Separate Boxes) - For Multiple Spouses
    return (
        <div className="custom-node-wrapper multi-spouse-mode">
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="handle-target" />

            <div className="node-body-transparent">
                {/* Husband Card */}
                <div className={`person-card ${data.gender}`}>
                    <div className="icon-wrapper">
                        {data.photo ? <img src={data.photo} alt="Profile" className="profile-photo" /> : <User size={16} />}
                    </div>
                    <div className="person-info">
                        <div className="person-name">
                            {data.label}
                            {data.nickname && <span className="nickname"> ({data.nickname})</span>}
                        </div>
                        {data.mobile && <div className="person-meta"><Phone size={8} /> {data.mobile}</div>}
                        {data.childIndex && <div className="child-badge"><Hash size={8} /> {data.childIndex}</div>}
                    </div>
                    <div className="person-actions">
                        <button className="mini-btn edit-btn" onClick={(e) => { e.stopPropagation(); data.onEdit(id, 'PRIMARY'); }}><Pencil size={10} /></button>
                        <button className="mini-btn delete-btn" onClick={(e) => { e.stopPropagation(); data.onDelete(id, 'PRIMARY'); }}><Trash2 size={10} /></button>
                    </div>
                    {/* Primary Source Handle */}
                    <Handle type="source" position={Position.Bottom} id="primary" className="handle-source" isConnectable={isConnectable} />
                </div>

                {/* Tree Structure Lines */}
                <div className="tree-structure-lines">
                    <div className="vertical-stem"></div>
                </div>

                {/* Spouses List */}
                <div className="spouses-list">
                    {spouses.map((spouse, index) => (
                        <div key={index} className="spouse-row">
                            <div className={`person-card ${spouse.gender || 'female'}`}>
                                <div className="icon-wrapper">
                                    {spouse.photo ? <img src={spouse.photo} alt="Profile" className="profile-photo" /> : <User size={16} />}
                                </div>
                                <div className="person-info">
                                    <div className="person-name">
                                        {spouse.name}
                                        {spouse.nickname && <span className="nickname"> ({spouse.nickname})</span>}
                                    </div>
                                    {spouse.mobile && <div className="person-meta"><Phone size={8} /> {spouse.mobile}</div>}
                                    {spouse.childIndex && <div className="child-badge"><Hash size={8} /> {spouse.childIndex}</div>}
                                </div>
                                <div className="person-actions">
                                    <button className="mini-btn edit-btn" onClick={(e) => { e.stopPropagation(); data.onEdit(id, 'SPOUSE', index); }}><Pencil size={10} /></button>
                                    <button className="mini-btn delete-btn" onClick={(e) => { e.stopPropagation(); data.onDelete(id, 'SPOUSE', index); }}><Trash2 size={10} /></button>
                                    <button className="mini-btn child-btn-small" onClick={(e) => { e.stopPropagation(); data.onAddChild(id, `spouse-${index}`); }} title="Add Child">
                                        <Plus size={10} />
                                    </button>
                                </div>
                                <Handle type="source" position={Position.Bottom} id={`spouse-${index}`} className="handle-source" style={{ left: '50%', transform: 'translateX(-50%)' }} isConnectable={isConnectable} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Only Add Spouse Button for Multi Mode (Child added via specific spouse) */}
            <div className="node-actions">
                <button className="action-btn spouse-btn" onClick={(e) => { e.stopPropagation(); data.onAddSpouse(id); }} title="Add Spouse">
                    <Heart size={12} />
                </button>
            </div>
        </div>
    );
});
