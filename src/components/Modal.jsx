import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, onSave, title, initialValues }) => {
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState(''); // New
    const [gender, setGender] = useState('male');
    const [mobile, setMobile] = useState('');
    const [childIndex, setChildIndex] = useState('');
    const [photo, setPhoto] = useState(null); // Base64 string
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);

    React.useEffect(() => {
        if (isOpen && initialValues) {
            setName(initialValues.name || '');
            setNickname(initialValues.nickname || '');
            setGender(initialValues.gender || 'male');
            setMobile(initialValues.mobile || '');
            setChildIndex(initialValues.childIndex || '');
            setPhoto(initialValues.photo || null);
        } else if (isOpen) {
            setName('');
            setNickname('');
            setGender('male');
            setMobile('');
            setChildIndex('');
            setPhoto(null);
        }
        return () => stopCamera(); // Cleanup on unmount/close
    }, [isOpen, initialValues]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            // Wait for ref to be available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setPhoto(dataUrl);
            stopCamera();
        }
    };

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        stopCamera();
        if (name) {
            onSave({ name, nickname, gender, mobile, childIndex, photo });
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-card">
                <h2>{title || 'Add Family Member'}</h2>
                <form onSubmit={handleSubmit}>

                    {/* Photo Upload Area */}
                    <div className="form-group photo-upload-group">
                        {isCameraOpen ? (
                            <div className="camera-preview">
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: 8 }} />
                                <div className="camera-controls">
                                    <button type="button" className="btn-primary-small" onClick={capturePhoto}>Capture</button>
                                    <button type="button" className="btn-cancel" onClick={stopCamera}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="photo-actions">
                                <label className="photo-label">
                                    {photo ? (
                                        <img src={photo} alt="Preview" className="photo-preview" />
                                    ) : (
                                        <div className="photo-placeholder">
                                            <Upload size={24} />
                                            <span>Upload Photo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <button type="button" className="btn-secondary-action" onClick={startCamera}>
                                    Use Camera
                                </button>
                                {photo && (
                                    <button type="button" className="remove-photo" onClick={() => setPhoto(null)}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. John Doe"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nickname (Optional)</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="e.g. Johnny"
                        />
                    </div>

                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label>Mobile Number</label>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label>Child Order</label>
                            <input
                                type="number"
                                value={childIndex}
                                onChange={(e) => setChildIndex(e.target.value)}
                                placeholder="#"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <div className="gender-options">
                            <label className={`radio-label ${gender === 'male' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={() => setGender('male')}
                                />
                                Male
                            </label>
                            <label className={`radio-label ${gender === 'female' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={() => setGender('female')}
                                />
                                Female
                            </label>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary-small">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
