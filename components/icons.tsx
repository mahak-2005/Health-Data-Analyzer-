
import React from 'react';

// A generic icon props interface to handle common SVG attributes like className
interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const Upload: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
);

export const TrendingUp: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
);

export const Activity: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);

export const AlertCircle: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
);

export const FileText: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
);

export const BrainCircuit: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.993.13a3 3 0 0 0 5.993-.13Zm0 0a3 3 0 1 0 5.993.13A3 3 0 0 0 12 5Z"/><path d="M12 12a3 3 0 1 0-5.993.13a3 3 0 0 0 5.993-.13Zm0 0a3 3 0 1 0 5.993.13A3 3 0 0 0 12 12Z"/><path d="M12 19a3 3 0 1 0-5.993.13a3 3 0 0 0 5.993-.13Zm0 0a3 3 0 1 0 5.993.13A3 3 0 0 0 12 19Z"/><path d="M12 5a3 3 0 0 0-3 3v1"/><path d="M12 12a3 3 0 0 0-3 3v1"/><path d="m14.5 5.5.5.5"/><path d="m9.5 5.5-.5.5"/><path d="m14.5 12.5.5.5"/><path d="m9.5 12.5-.5.5"/><path d="m14.5 19.5.5.5"/><path d="m9.5 19.5-.5.5"/><path d="M12 5a3 3 0 0 1 3 3v1"/><path d="M12 12a3 3 0 0 1 3 3v1"/></svg>
);
