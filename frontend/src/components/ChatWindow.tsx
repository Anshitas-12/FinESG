import React, { useEffect, useRef } from 'react';
import { FileText, Leaf, User, Loader2 } from 'lucide-react';
import { useChat, Message, FileAttachment } from '@/contexts/ChatContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import MessageInput from './MessageInput';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WelcomeScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
      <Leaf className="h-10 w-10 text-primary" />
    </div>
    <h1 className="text-3xl font-bold text-foreground mb-3">
      ESG Report Generator
    </h1>
    <p className="text-muted-foreground max-w-md mb-8">
      Upload your company's annual or financial report and receive a comprehensive
      Environmental, Social, and Governance (ESG) analysis.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
      {[
        { title: 'Environmental', desc: 'Carbon emissions, energy efficiency, waste management' },
        { title: 'Social', desc: 'Employee wellbeing, diversity, community engagement' },
        { title: 'Governance', desc: 'Board structure, executive compensation, risk management' },
      ].map((item) => (
        <div
          key={item.title}
          className="p-4 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-shadow"
        >
          <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
          <p className="text-xs text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

interface MessageBubbleProps {
  message: Message;
}

const FileBubble: React.FC<{ file: FileAttachment }> = ({ file }) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-primary-foreground/10 rounded-lg">
      <FileText className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs opacity-70">{formatSize(file.size)}</p>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl mx-auto px-4 py-4",
        isUser ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
        isUser ? "bg-bubble-user" : "bg-primary/10"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-bubble-user-foreground" />
        ) : (
          <Leaf className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? 'You' : 'ESG Assistant'}
        </p>

        {/* Files */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.files.map(file => (
              <FileBubble key={file.id} file={file} />
            ))}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div className={cn(
            "prose prose-sm max-w-none dark:prose-invert",
            "prose-headings:text-foreground prose-headings:font-semibold",
            "prose-p:text-foreground prose-p:leading-relaxed prose-p:my-2",
            "prose-strong:text-foreground prose-strong:font-semibold",
            "prose-ul:text-foreground prose-ol:text-foreground prose-ul:my-2 prose-ol:my-2",
            "prose-li:text-foreground prose-li:marker:text-primary prose-li:my-1",
            "prose-hr:border-border prose-hr:my-4",
            "prose-h1:text-2xl prose-h1:mt-4 prose-h1:mb-3",
            "prose-h2:text-xl prose-h2:mt-4 prose-h2:mb-2",
            "prose-h3:text-lg prose-h3:mt-3 prose-h3:mb-2",
            "prose-h4:text-base prose-h4:mt-3 prose-h4:mb-2"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
  <div className="flex gap-3 max-w-4xl mx-auto px-4 py-4 animate-fade-in">
    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Leaf className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">ESG Assistant</p>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Analyzing report and generating ESG assessment...</span>
      </div>
    </div>
  </div>
);

const ChatWindow: React.FC = () => {
  const { currentChat, isLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat?.messages, isLoading]);

  const hasMessages = currentChat && currentChat.messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        {hasMessages ? (
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className="py-6">
              {currentChat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center">
            <WelcomeScreen />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm pt-4">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatWindow;
