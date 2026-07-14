import { memo } from 'react';

function Button({ variant = 'primary', size = 'md', loading = false, icon, children, className = '', ...rest }) {
  const cls = ['te-btn', `te-btn-${variant}`, size === 'sm' ? 'te-btn-sm' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? <i className="ti ti-loader-2" style={{ animation: 'spin 0.8s linear infinite' }} /> : icon && <i className={`ti ${icon}`} />}
      {children}
    </button>
  );
}

export default memo(Button);
