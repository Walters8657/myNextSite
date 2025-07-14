import './toolCard.scss';
import React from 'react';

export default function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="toolCard">
      {children}
    </div>
  );
}