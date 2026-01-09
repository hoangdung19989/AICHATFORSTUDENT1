
import React, { useMemo } from 'react';

interface MathRendererProps {
    content: string;
    className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
    // Tách chuỗi dựa trên ký tự $...$ (inline math) hoặc $$...$$ (block math)
    const parts = useMemo(() => {
        if (!content) return [];
        // Regex split: giữ lại delimiter
        return content.split(/(\$[^$]+\$)/g);
    }, [content]);

    const renderPart = (part: string, index: number) => {
        if (part.startsWith('$') && part.endsWith('$')) {
            const latex = part.slice(1, -1);
            try {
                // @ts-ignore
                if (window.katex) {
                    // @ts-ignore
                    const html = window.katex.renderToString(latex, {
                        throwOnError: false,
                        displayMode: false
                    });
                    return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
                }
                return <span key={index} className="font-mono text-blue-600 mx-1">{latex}</span>;
            } catch (e) {
                return <span key={index} className="text-red-500">{part}</span>;
            }
        }
        // Văn bản thường: thay thế xuống dòng bằng khoảng trắng để tránh vỡ giao diện nút bấm
        return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, ' ') }} />;
    };

    return (
        <span className={`leading-relaxed ${className}`}>
            {parts.map((part, idx) => renderPart(part, idx))}
        </span>
    );
};

export default MathRenderer;
