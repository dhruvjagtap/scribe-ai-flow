
import React, { useState, useEffect } from 'react';
import { TextEditor } from './TextEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { EditorToolbar } from './EditorToolbar';
import { useToast } from "@/hooks/use-toast";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";

export const EditorLayout = () => {
  const [text, setText] = useState<string>('# Welcome to Scribe AI\n\nThis is a smart text editor with Markdown support, voice recognition, and more.\n\n## Features\n\n- **Bold text** and _italic text_\n- Speech-to-text\n- Markdown preview\n- Export to .txt or .md\n- Dark mode support\n\nStart typing to create your document!');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Handle theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Handle recording toggle
  const toggleRecording = () => {
    // Check if the browser supports the Web Speech API
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRecording(!isRecording);
    
    if (isRecording) {
      toast({
        title: "Recording Stopped",
        description: "Voice recognition has been disabled."
      });
    }
  };
  
  // Format text (bold, italic, etc.)
  const handleFormat = (format: string) => {
    // Define format markers
    const formatMarkers: Record<string, { prefix: string; suffix: string }> = {
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '_', suffix: '_' },
      underline: { prefix: '<u>', suffix: '</u>' },
      h1: { prefix: '# ', suffix: '' },
      h2: { prefix: '## ', suffix: '' },
      ul: { prefix: '- ', suffix: '' },
      ol: { prefix: '1. ', suffix: '' },
      quote: { prefix: '> ', suffix: '' },
      code: { prefix: '`', suffix: '`' },
      link: { prefix: '[', suffix: '](url)' }
    };
    
    // Get the marker for the selected format
    const marker = formatMarkers[format];
    if (!marker) return;
    
    // Get the selected text
    const selectedText = text.substring(selection.start, selection.end);
    
    // If it's a block format (h1, h2, ul, ol, quote)
    const isBlockFormat = ['h1', 'h2', 'ul', 'ol', 'quote'].includes(format);
    
    if (isBlockFormat) {
      // Find the start of the line
      let lineStart = selection.start;
      while (lineStart > 0 && text[lineStart - 1] !== '\n') {
        lineStart--;
      }
      
      // Check if the line already has this format
      const linePrefix = text.substring(lineStart, lineStart + marker.prefix.length);
      const hasFormat = linePrefix === marker.prefix;
      
      // Toggle the format
      if (hasFormat) {
        // Remove the format
        const newText = text.substring(0, lineStart) + 
                       text.substring(lineStart + marker.prefix.length);
        setText(newText);
      } else {
        // Add the format
        const newText = text.substring(0, lineStart) + 
                       marker.prefix + 
                       text.substring(lineStart);
        setText(newText);
      }
    } else {
      // For inline formats (bold, italic, etc.)
      // Check if the selection already has this format
      const hasFormat = 
        text.substring(Math.max(0, selection.start - marker.prefix.length), selection.start) === marker.prefix && 
        text.substring(selection.end, Math.min(text.length, selection.end + marker.suffix.length)) === marker.suffix;
      
      if (hasFormat) {
        // Remove the format
        const newText = text.substring(0, selection.start - marker.prefix.length) + 
                       selectedText + 
                       text.substring(selection.end + marker.suffix.length);
        setText(newText);
      } else {
        // Add the format
        const newText = text.substring(0, selection.start) + 
                       marker.prefix + 
                       selectedText + 
                       marker.suffix + 
                       text.substring(selection.end);
        setText(newText);
      }
    }
  };
  
  // Export the document
  const handleExport = (format: 'txt' | 'md') => {
    const filename = `document.${format}`;
    const blob = new Blob([text], { type: 'text/plain' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Document exported as ${filename}`
    });
  };
  
  // Set dark mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Detect active formats based on cursor position
  useEffect(() => {
    const formats: string[] = [];
    
    // Check for block formats
    let lineStart = selection.start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    const currentLine = text.substring(lineStart, text.indexOf('\n', lineStart) > -1 ? text.indexOf('\n', lineStart) : text.length);
    
    if (currentLine.startsWith('# ')) formats.push('h1');
    if (currentLine.startsWith('## ')) formats.push('h2');
    if (currentLine.startsWith('- ')) formats.push('ul');
    if (/^\d+\.\s/.test(currentLine)) formats.push('ol');
    if (currentLine.startsWith('> ')) formats.push('quote');
    
    // Check for inline formats
    const surroundingText = text.substring(
      Math.max(0, selection.start - 10),
      Math.min(text.length, selection.end + 10)
    );
    
    if (surroundingText.includes('**')) formats.push('bold');
    if (surroundingText.includes('_')) formats.push('italic');
    if (surroundingText.includes('<u>')) formats.push('underline');
    if (surroundingText.includes('`')) formats.push('code');
    if (surroundingText.includes('[') && surroundingText.includes('](')) formats.push('link');
    
    setActiveFormats(formats);
  }, [selection, text]);
  
  return (
    <div className="h-screen flex flex-col">
      <EditorToolbar 
        isDark={isDarkMode}
        toggleTheme={toggleTheme}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        onFormat={handleFormat}
        activeFormats={activeFormats}
        onExport={handleExport}
      />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <TextEditor 
            value={text}
            onChange={setText}
            onSelectionChange={setSelection}
            isRecording={isRecording}
          />
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <MarkdownPreview markdown={text} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
