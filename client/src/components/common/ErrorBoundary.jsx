import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by Error Boundary:', error);
    console.error('Error Info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <div style={contentStyle}>
            <h1 style={titleStyle}>⚠️ Something Went Wrong</h1>
            <p style={messageStyle}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div style={debugStyle}>
                <h3>Error Details (Development Mode):</h3>
                <p style={errorTextStyle}>
                  <strong>Error:</strong> {this.state.error?.toString()}
                </p>
                {this.state.errorInfo && (
                  <details style={detailsStyle}>
                    <summary>Stack Trace</summary>
                    <pre style={preStyle}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div style={buttonContainerStyle}>
              <button onClick={this.handleReset} style={primaryButtonStyle}>
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                style={secondaryButtonStyle}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Styles
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  padding: '1rem',
};

const contentStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: '2rem',
  maxWidth: '600px',
  textAlign: 'center',
};

const titleStyle = {
  color: '#d32f2f',
  marginBottom: '1rem',
  fontSize: '1.8rem',
};

const messageStyle = {
  color: '#666',
  marginBottom: '1.5rem',
  fontSize: '1rem',
  lineHeight: '1.5',
};

const debugStyle = {
  backgroundColor: '#f9f9f9',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '1rem',
  marginBottom: '1.5rem',
  textAlign: 'left',
};

const errorTextStyle = {
  color: '#d32f2f',
  fontFamily: 'monospace',
  fontSize: '0.85rem',
  wordBreak: 'break-word',
  margin: '0.5rem 0',
};

const detailsStyle = {
  marginTop: '1rem',
  textAlign: 'left',
};

const preStyle = {
  backgroundColor: '#f0f0f0',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '1rem',
  overflow: 'auto',
  maxHeight: '300px',
  fontSize: '0.75rem',
  fontFamily: 'monospace',
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const primaryButtonStyle = {
  backgroundColor: '#1976d2',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
};

const secondaryButtonStyle = {
  backgroundColor: '#666',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#555',
  },
};

export default ErrorBoundary;
