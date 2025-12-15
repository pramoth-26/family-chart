import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        if (confirm("This will clear all local Family Tree data to fix the crash. Are you sure?")) {
            localStorage.removeItem('family_tree_data');
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1a1a1a',
                    color: 'white',
                    fontFamily: 'sans-serif'
                }}>
                    <h2>Something went wrong.</h2>
                    <p style={{ color: '#ccc', marginBottom: '20px' }}>
                        The application encountered a critical error.
                    </p>
                    <pre style={{
                        background: '#333',
                        padding: '10px',
                        borderRadius: '5px',
                        maxWidth: '80%',
                        overflow: 'auto',
                        marginBottom: '20px',
                        fontSize: '0.8rem'
                    }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '10px 20px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reset Data & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
