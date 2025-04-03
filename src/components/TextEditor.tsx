
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "sonner";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  isRecording: boolean;
  autoFocus?: boolean;
}

export const TextEditor = ({ 
  value, 
  onChange, 
  onSelectionChange, 
  isRecording,
  autoFocus = true
}: TextEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('_', '_');
          break;
        case 'u':
          e.preventDefault();
          // Markdown doesn't have native underline, but we can use HTML
          insertMarkdown('<u>', '</u>');
          break;
      }
    }
    
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorRef.current!.selectionStart;
      const end = editorRef.current!.selectionEnd;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string) => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selectedText = value.substring(start, end);
    
    // If text is selected, wrap it with markdown
    // If no text is selected, insert markers and place cursor between them
    const newValue = 
      value.substring(0, start) + 
      prefix + 
      selectedText + 
      suffix + 
      value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position appropriately
    setTimeout(() => {
      if (editorRef.current) {
        if (selectedText.length > 0) {
          editorRef.current.selectionStart = start + prefix.length;
          editorRef.current.selectionEnd = start + prefix.length + selectedText.length;
        } else {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + prefix.length;
        }
        editorRef.current.focus();
      }
    }, 0);
  };
  
  const handleSelectionChange = () => {
    if (onSelectionChange && editorRef.current) {
      onSelectionChange({
        start: editorRef.current.selectionStart,
        end: editorRef.current.selectionEnd
      });
    }
  };
  
  // SpeechRecognition setup
  useEffect(() => {
    if (!isRecording || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      return;
    }
    
    // Use the appropriate constructor
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    let finalTranscript = '';
    
    recognition.onstart = () => {
      finalTranscript = '';
      toast.success("Voice recognition activated");
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Add the final transcript to the editor at the current cursor position
      if (finalTranscript && editorRef.current) {
        const cursorPos = editorRef.current.selectionStart;
        const newValue = 
          value.substring(0, cursorPos) + 
          finalTranscript + 
          value.substring(cursorPos);
        
        onChange(newValue);
        
        // Move cursor to the end of inserted text
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = 
            editorRef.current.selectionEnd = 
              cursorPos + finalTranscript.length;
          }
        }, 0);
        
        finalTranscript = '';
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
    };
    
    recognition.onend = () => {
      if (isRecording) {
        // If still recording, restart recognition
        // (it might end due to silence or other reasons)
        recognition.start();
      }
    };
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Speech recognition failed to start:', error);
      toast.error("Failed to start speech recognition");
    }
    
    return () => {
      recognition.stop();
    };
  }, [isRecording, value, onChange]);
  
  // Focus the editor on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={editorRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onSelect={handleSelectionChange}
      className="w-full h-full p-4 resize-none focus:outline-none font-mono text-editor-text bg-editor-bg"
      placeholder="Start typing here... or use voice recognition with the mic button"
    />
  );
};
