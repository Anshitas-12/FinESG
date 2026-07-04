import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, FileText } from 'lucide-react';
import { FileAttachment, useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && files.length === 0) || isLoading) return;

    const originalMessage = message;
    const originalFiles = files;

    // Clear input fields optimistically
    setMessage('');
    setFiles([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendMessage(originalMessage.trim(), originalFiles.length > 0 ? originalFiles : undefined);
    } catch (err) {
      // Restore input on failure so user doesn't lose prompt
      setMessage(originalMessage);
      setFiles(originalFiles);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const validateAndAddFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'text/plain'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) return false;
    if (file.size > maxSize) return false;

    return true;
  };

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: FileAttachment[] = [];
    Array.from(fileList).forEach(file => {
      if (validateAndAddFile(file)) {
        newFiles.push({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
        });
      }
    });

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* File Bubbles */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border shadow-soft"
            >
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate max-w-[140px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="h-5 w-5 rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-end gap-2 p-3 bg-card rounded-2xl border shadow-soft transition-all duration-200",
          isDragging ? "border-primary ring-2 ring-primary/20" : "border-border",
          isLoading && "opacity-70"
        )}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,text/plain,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Attach button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Upload a report or describe what you need..."
          className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-[200px] py-2 scrollbar-thin"
          rows={1}
          disabled={isLoading}
        />

        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl bg-primary hover:bg-primary/90 transition-all"
          disabled={(!message.trim() && files.length === 0) || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary">
            <p className="text-primary font-medium">Drop files here</p>
          </div>
        )}
      </form>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Upload annual or financial reports (PDF/TXT) to generate ESG analysis
      </p>
    </div>
  );
};

export default MessageInput;
