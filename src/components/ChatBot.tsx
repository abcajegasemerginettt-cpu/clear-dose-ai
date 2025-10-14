import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import { googleAIService } from '@/utils/googleAI';
import { toast } from 'sonner';

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  description: string;
  medicine_type: 'tablet' | 'capsule';
  variants: string[];
  side_effects: string[];
  storage: string;
  category: string;
  confidence?: number;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  medicine: Medicine;
}

const formatAIResponse = (text: string): string => { 
    let html = text 
    // Bold text: **text** -> <strong>text</strong> 
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
    // Italic text: *text* (but not **text**) 
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>'); 
   
    // Handle lists first to avoid adding <br> tags inside them 
    html = html.replace(/^[\s]*[-*•]\s+(.+)$/gm, '<div style="display: flex; align-items: flex-start; margin: 0; padding: 0; line-height: 1.2;"><span style="margin-right: 0.5rem;">•</span><span>$1</span></div>'); 
   
    html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<div style="display: flex; align-items: flex-start; margin: 0; padding: 0; line-height: 1.2;"><span style="margin-right: 0.5rem;">$1.</span><span>$2</span></div>'); 
   
    // Now, handle line breaks more carefully 
    // Replace double line breaks with a single <br> for paragraph breaks 
    html = html.replace(/\n\n/g, '<br>'); 
   
    // Remove single line breaks that might be left over, especially around lists. 
    // This helps to avoid extra spaces when list items are directly next to each other in the source text. 
    html = html.replace(/(<\/div>)\n(<div)/g, '$1$2'); 
   
    return html; 
   };

export const ChatBot = ({ medicine }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm here to help you with questions about ${medicine.name}. Feel free to ask me anything about this medication, its usage, side effects, or general information.`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Use setTimeout to ensure the DOM has updated
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await googleAIService.askAboutMedicine(inputValue.trim(), medicine);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get response from AI assistant. Please check your API key configuration.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your question. Please try again or check if the Google AI Studio API key is properly configured.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const handleCopyMessage = async (messageText: string, messageId: string) => {
    try {
      // Remove HTML tags for plain text copy
      const plainText = messageText
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      await navigator.clipboard.writeText(plainText);
      setCopiedMessageId(messageId);
      toast.success('Message copied to clipboard');
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  if (!isExpanded) {
    return (
      <Card className="glass-card p-4">
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-full gap-2 medical-gradient text-white hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          Ask AI about {medicine.name}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full p-2 medical-gradient">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <h4 className="font-semibold">AI Assistant</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="text-muted-foreground"
        >
          ×
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className="h-64 w-full rounded-md border p-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className="rounded-full p-1.5 bg-primary/10 flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}
              >
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: formatAIResponse(message.text)
                  }}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {!message.isUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyMessage(message.text, message.id)}
                      className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {message.isUser && (
                <div className="rounded-full p-1.5 bg-primary/10 flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="rounded-full p-1.5 bg-primary/10 flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about dosage, side effects, interactions..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
};
