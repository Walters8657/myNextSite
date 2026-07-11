import './toolCard.scss';
import React from 'react';

export default function ToolCard({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="toolCard">
      <div id="titleBar">
        <p>{title}</p>
      </div>
      <div id="content">
        {children}
      </div>
    </div>
  );
}