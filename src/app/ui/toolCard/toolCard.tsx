import './toolCard.scss';
import React from 'react';

export default function ToolCard({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="toolCard">
        {children}
    </div>
  );
}