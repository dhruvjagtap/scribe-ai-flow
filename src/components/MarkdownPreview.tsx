
import React, { useEffect, useState } from 'react';

// Simple markdown parser (will just handle basic formatting)
const parseMarkdown = (markdown: string): string => {
  let html = markdown;
  
  // Handle headings
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  
  // Handle bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic
  html = html.replace(/\_(.*?)\_/g, '<em>$1</em>');
  
  // Handle code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Handle inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Handle blockquotes
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
  
  // Handle unordered lists
  html = html.replace(/^- (.*)$/gm, '<ul><li>$1</li></ul>');
  
  // Handle ordered lists
  html = html.replace(/^\d+\. (.*)$/gm, '<ol><li>$1</li></ol>');
  
  // Handle line breaks
  html = html.replace(/\n/g, '<br>');
  
  // Clean up list nesting
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/<\/ol>\s*<ol>/g, '');
  
  // Pass through HTML (for underline)
  // Note: In a production app, you'd sanitize this to prevent XSS attacks
  
  return html;
};

interface MarkdownPreviewProps {
  markdown: string;
}

export const MarkdownPreview = ({ markdown }: MarkdownPreviewProps) => {
  const [html, setHtml] = useState('');
  
  useEffect(() => {
    setHtml(parseMarkdown(markdown));
  }, [markdown]);
  
  return (
    <div 
      className="w-full h-full p-4 overflow-auto markdown-preview prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
