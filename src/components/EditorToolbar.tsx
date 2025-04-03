
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Mic,
  LinkIcon,
  Download,
  FileText,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ButtonProps } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolbarButtonProps extends ButtonProps {
  icon: React.ReactNode;
  isActive?: boolean;
  title?: string;
}

const ToolbarButton = ({ 
  icon, 
  onClick, 
  isActive = false,
  title,
  ...props 
}: ToolbarButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className={`h-8 w-8 ${isActive ? 'bg-primary/10 text-primary' : ''}`}
    title={title}
    {...props}
  >
    {icon}
  </Button>
);

interface EditorToolbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  onFormat: (format: string) => void;
  activeFormats: string[];
  onExport: (format: 'txt' | 'md') => void;
}

export const EditorToolbar = ({
  isDark,
  toggleTheme,
  isRecording,
  toggleRecording,
  onFormat,
  activeFormats,
  onExport
}: EditorToolbarProps) => {
  return (
    <div className="editor-toolbar flex items-center p-2 border-b gap-0.5 overflow-x-auto">
      <ToolbarButton 
        icon={<Bold className="h-4 w-4" />} 
        onClick={() => onFormat('bold')}
        isActive={activeFormats.includes('bold')}
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton 
        icon={<Italic className="h-4 w-4" />} 
        onClick={() => onFormat('italic')}
        isActive={activeFormats.includes('italic')}
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton 
        icon={<Underline className="h-4 w-4" />} 
        onClick={() => onFormat('underline')}
        isActive={activeFormats.includes('underline')}
        title="Underline (Ctrl+U)"
      />
      
      <div className="w-px h-6 bg-border mx-1"></div>
      
      <ToolbarButton 
        icon={<Heading1 className="h-4 w-4" />} 
        onClick={() => onFormat('h1')}
        isActive={activeFormats.includes('h1')}
        title="Heading 1"
      />
      <ToolbarButton 
        icon={<Heading2 className="h-4 w-4" />} 
        onClick={() => onFormat('h2')}
        isActive={activeFormats.includes('h2')}
        title="Heading 2"
      />
      
      <div className="w-px h-6 bg-border mx-1"></div>
      
      <ToolbarButton 
        icon={<List className="h-4 w-4" />} 
        onClick={() => onFormat('ul')}
        isActive={activeFormats.includes('ul')}
        title="Bullet List"
      />
      <ToolbarButton 
        icon={<ListOrdered className="h-4 w-4" />} 
        onClick={() => onFormat('ol')}
        isActive={activeFormats.includes('ol')}
        title="Numbered List"
      />
      <ToolbarButton 
        icon={<Quote className="h-4 w-4" />} 
        onClick={() => onFormat('quote')}
        isActive={activeFormats.includes('quote')}
        title="Blockquote"
      />
      <ToolbarButton 
        icon={<Code className="h-4 w-4" />} 
        onClick={() => onFormat('code')}
        isActive={activeFormats.includes('code')}
        title="Code"
      />
      <ToolbarButton 
        icon={<LinkIcon className="h-4 w-4" />} 
        onClick={() => onFormat('link')}
        isActive={activeFormats.includes('link')}
        title="Link"
      />
      
      <div className="w-px h-6 bg-border mx-1"></div>
      
      <ToolbarButton 
        icon={<Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />} 
        onClick={toggleRecording}
        isActive={isRecording}
        title={isRecording ? "Stop Recording" : "Start Recording"}
      />
      
      <div className="ml-auto flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Export">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('txt')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export as .txt</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('md')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export as .md</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      </div>
    </div>
  );
};
