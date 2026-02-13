import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary компонент для отлова ошибок React
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Логируем ошибку только в dev режиме
        if (import.meta.env.DEV) {
             
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        Что-то пошло не так 😔
                    </h1>
                    <p style={{ marginBottom: '2rem', color: '#666' }}>
                        Произошла ошибка при загрузке приложения
                    </p>
                    {import.meta.env.DEV && this.state.error && (
                        <pre
                            style={{
                                padding: '1rem',
                                background: '#f5f5f5',
                                borderRadius: '8px',
                                maxWidth: '600px',
                                overflow: 'auto',
                                textAlign: 'left',
                                fontSize: '0.875rem',
                            }}
                        >
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Попробовать снова
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
