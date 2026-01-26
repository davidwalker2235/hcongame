import React from 'react';

/**
 * Procesa texto con formato markdown simple:
 * - **texto** se convierte en negrita
 * - \n se convierte en saltos de línea
 */
export function processText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Convertir \n (string literal) en saltos de línea reales
  const withLineBreaks = text.replace(/\\n/g, '\n');
  
  // Dividir por saltos de línea reales
  const lines = withLineBreaks.split('\n');
  
  const result: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Añadir salto de línea antes de cada línea excepto la primera
    if (lineIndex > 0) {
      result.push(<br key={`br-${lineIndex}`} />);
    }
    
    // Si la línea está vacía, añadir un espacio para mantener el salto de línea
    if (line === '') {
      result.push(<span key={`empty-${lineIndex}`}>&nbsp;</span>);
      return;
    }
    
    // Procesar negritas en esta línea
    const parts: React.ReactNode[] = [];
    let keyCounter = 0;
    
    // Regex para encontrar **texto** (no greedy para capturar múltiples instancias)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;
    
    while ((match = boldRegex.exec(line)) !== null) {
      // Añadir texto antes del match
      if (match.index > lastIndex) {
        const beforeText = line.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push(
            <span key={`text-${lineIndex}-${keyCounter++}`}>{beforeText}</span>
          );
        }
      }
      
      // Añadir texto en negrita
      parts.push(
        <strong key={`bold-${lineIndex}-${keyCounter++}`}>{match[1]}</strong>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Añadir texto restante después del último match
    if (lastIndex < line.length) {
      const remainingText = line.substring(lastIndex);
      if (remainingText) {
        parts.push(
          <span key={`text-${lineIndex}-${keyCounter++}`}>{remainingText}</span>
        );
      }
    }
    
    // Si no hubo matches de negrita, añadir la línea completa
    if (parts.length === 0 && line) {
      parts.push(<span key={`text-${lineIndex}-${keyCounter++}`}>{line}</span>);
    }
    
    result.push(...parts);
  });
  
  return result;
}
