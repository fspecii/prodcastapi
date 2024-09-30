import React from 'react';

interface DiagramRendererProps {
  diagram: any;
}

const DiagramRenderer: React.FC<DiagramRendererProps> = ({ diagram }) => {
  console.log('DiagramRenderer received diagram:', JSON.stringify(diagram, null, 2));

  if (!diagram) {
    console.warn('DiagramRenderer: No diagram provided');
    return null;
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <h2 style={{ color: '#FFD700', fontSize: '36px', marginBottom: '20px' }}>{diagram.title}</h2>
      <p style={{ color: '#FFFFFF', fontSize: '24px', marginBottom: '30px', textAlign: 'center' }}>{diagram.description}</p>
      <ul style={{ color: '#FFFFFF', fontSize: '20px', listStyleType: 'none', padding: 0 }}>
        {diagram.elements.map((el: any) => (
          <li key={el.id} style={{ marginBottom: '15px' }}>
            {el.text} 
            {el.connections && el.connections.length > 0 && (
              <span style={{ color: '#FFD700' }}> → {el.connections.join(', ')}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DiagramRenderer;