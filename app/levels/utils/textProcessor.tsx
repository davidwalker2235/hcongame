import React from 'react';

/**
 * Procesa texto con formato markdown simple:
 * - **texto** se convierte en negrita
 * - *texto* se convierte en cursiva
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
    
    // Procesar negritas y cursivas en esta línea
    const parts: React.ReactNode[] = [];
    let keyCounter = 0;
    
    // Función auxiliar para procesar una línea con formato
    const processFormattedLine = (textLine: string): React.ReactNode[] => {
      const lineParts: React.ReactNode[] = [];
      let currentPos = 0;
      
      // Encontrar todas las negritas (**texto**) y cursivas (*texto*)
      const matches: Array<{
        start: number;
        end: number;
        type: 'bold' | 'italic';
        content: string;
      }> = [];
      
      // Buscar negritas primero
      const boldRegex = /\*\*(.*?)\*\*/g;
      let boldMatch: RegExpExecArray | null;
      while ((boldMatch = boldRegex.exec(textLine)) !== null) {
        matches.push({
          start: boldMatch.index,
          end: boldMatch.index + boldMatch[0].length,
          type: 'bold' as const,
          content: boldMatch[1]
        });
      }
      
      // Buscar cursivas, pero excluir las que están dentro de negritas
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch: RegExpExecArray | null = null;
      while ((italicMatch = italicRegex.exec(textLine)) !== null) {
        // Verificar que no esté dentro de una negrita
        const matchIndex = italicMatch.index;
        const isInsideBold = matches.some(m => 
          m.type === 'bold' && 
          matchIndex >= m.start && 
          matchIndex < m.end
        );
        
        if (!isInsideBold) {
          matches.push({
            start: matchIndex,
            end: matchIndex + italicMatch[0].length,
            type: 'italic' as const,
            content: italicMatch[1]
          });
        }
      }
      
      // Ordenar matches por posición
      matches.sort((a, b) => a.start - b.start);
      
      // Procesar matches en orden
      matches.forEach((match) => {
        // Añadir texto antes del match
        if (match.start > currentPos) {
          const beforeText = textLine.substring(currentPos, match.start);
          if (beforeText) {
            lineParts.push(
              <span key={`text-${lineIndex}-${keyCounter++}`}>{beforeText}</span>
            );
          }
        }
        
        // Añadir el texto formateado
        if (match.type === 'bold') {
          lineParts.push(
            <strong key={`bold-${lineIndex}-${keyCounter++}`}>{match.content}</strong>
          );
        } else {
          lineParts.push(
            <em key={`italic-${lineIndex}-${keyCounter++}`}>{match.content}</em>
          );
        }
        
        currentPos = match.end;
      });
      
      // Añadir texto restante
      if (currentPos < textLine.length) {
        const remainingText = textLine.substring(currentPos);
        if (remainingText) {
          lineParts.push(
            <span key={`text-${lineIndex}-${keyCounter++}`}>{remainingText}</span>
          );
        }
      }
      
      return lineParts;
    };
    
    const formattedParts = processFormattedLine(line);
    parts.push(...formattedParts);
    
    // Si no hubo matches, añadir la línea completa
    if (parts.length === 0 && line) {
      parts.push(<span key={`text-${lineIndex}-${keyCounter++}`}>{line}</span>);
    }
    
    result.push(...parts);
  });
  
  return result;
}
