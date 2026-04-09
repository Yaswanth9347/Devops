import React from 'react';
import { Loader2 } from 'lucide-react';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  icon: Icon,
  className = '',
  style = {},
  ...props 
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          background: 'var(--error-color)',
          color: '#ffffff',
          border: '1px solid var(--error-color)',
        };
      case 'primary':
      default:
        return {
          background: 'var(--primary-color)',
          color: '#ffffff',
          border: '1px solid var(--primary-color)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '15px', borderRadius: 'var(--radius-lg)' };
      case 'md':
      default:
        return { padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--radius-md)' };
    }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    opacity: props.disabled || isLoading ? 0.6 : 1,
    cursor: props.disabled || isLoading ? 'not-allowed' : 'pointer',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <button 
      style={baseStyles}
      disabled={props.disabled || isLoading}
      {...props}
      onMouseOver={(e) => {
        if (props.disabled || isLoading) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--primary-hover)';
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--bg-hover)';
        if (variant === 'ghost') e.currentTarget.style.background = 'var(--bg-hover)';
      }}
      onMouseOut={(e) => {
        if (props.disabled || isLoading) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--primary-color)';
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--bg-secondary)';
        if (variant === 'ghost') e.currentTarget.style.background = 'transparent';
      }}
    >
      {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export default Button;
