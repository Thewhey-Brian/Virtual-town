'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  Check, 
  X, 
  RotateCcw, 
  History,
  MessageSquare,
  MapPin,
  User,
  Bot,
  AlertCircle
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface CommandHistory {
  id: string;
  promptText: string;
  parsedIntent: string;
  confidence: number;
  status: string;
  aiResponse: string;
  createdAt: string;
  executionResult?: {
    success: boolean;
    message: string;
    changes: Array<{
      type: string;
      description: string;
    }>;
  };
}

interface ParsedCommand {
  intent: string;
  confidence: number;
  entities: {
    characterName?: string;
    targetLocationName?: string;
  };
  explanation: string;
  requiresConfirmation: boolean;
}

export default function PromptPage() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<{
    promptId: string;
    parsedCommand: ParsedCommand;
  } | null>(null);
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, pendingCommand]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/prompts?limit=20');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setPendingCommand(null);

    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: input }),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.executionResult) {
          // Auto-executed
          toast.success(data.executionResult.message);
          fetchHistory();
        } else if (data.parsedCommand.requiresConfirmation) {
          // Needs confirmation
          setPendingCommand({
            promptId: data.prompt.id,
            parsedCommand: data.parsedCommand,
          });
        }
      } else {
        toast.error('Failed to process command');
      }
    } catch (error) {
      toast.error('Error processing command');
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  };

  const handleConfirm = async () => {
    if (!pendingCommand) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: pendingCommand.promptId,
          action: 'confirm',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.executionResult?.success) {
          toast.success(data.executionResult.message);
        } else {
          toast.error(data.executionResult?.message || 'Execution failed');
        }
        setPendingCommand(null);
        fetchHistory();
      }
    } catch (error) {
      toast.error('Error confirming command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!pendingCommand) return;

    try {
      await fetch('/api/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: pendingCommand.promptId,
          action: 'cancel',
        }),
      });
      setPendingCommand(null);
    } catch (error) {
      console.error('Error canceling:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode }> = {
      COMPLETED: { color: 'bg-green-100 text-green-700', icon: <Check className="w-3 h-3" /> },
      FAILED: { color: 'bg-red-100 text-red-700', icon: <X className="w-3 h-3" /> },
      PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-3 h-3" /> },
      REJECTED: { color: 'bg-gray-100 text-gray-700', icon: <X className="w-3 h-3" /> },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <Badge className={config.color}>
        {config.icon}
        <span className="ml-1">{status.toLowerCase()}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4 h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e59a3d] to-[#d4862a] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
                <p className="text-muted-foreground">
                  Control characters using natural language
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left Panel - Command Input */}
            <div className="flex-1 flex flex-col">
              <Card className="flex-1 p-6 flex flex-col">
                <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {/* Welcome Message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e59a3d] to-[#d4862a] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-sm">
                        <p className="font-medium mb-1">Welcome to Command Center!</p>
                        <p className="text-muted-foreground">
                          You can control characters using natural language. Try commands like:
                        </p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• &quot;Make John go to Starbucks&quot;</li>
                          <li>• &quot;Move Sarah to the park&quot;</li>
                          <li>• &quot;Have Mike meet Emma at the cafe&quot;</li>
                          <li>• &quot;Change Alex&apos;s mood to happy&quot;</li>
                        </ul>
                      </div>
                    </div>

                    {/* Pending Command */}
                    <AnimatePresence>
                      {pendingCommand && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e59a3d] to-[#d4862a] flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <Card className="p-4 border-amber-200 bg-amber-50">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-medium">Command Parsed</p>
                                  <p className="text-sm text-muted-foreground">
                                    Confidence: {Math.round(pendingCommand.parsedCommand.confidence * 100)}%
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {pendingCommand.parsedCommand.intent}
                                </Badge>
                              </div>
                              
                              <p className="text-sm mb-4">
                                {pendingCommand.parsedCommand.explanation}
                              </p>

                              {pendingCommand.parsedCommand.entities.characterName && (
                                <div className="flex items-center gap-2 text-sm mb-2">
                                  <User className="w-4 h-4 text-[#e59a3d]" />
                                  <span>{pendingCommand.parsedCommand.entities.characterName}</span>
                                </div>
                              )}
                              
                              {pendingCommand.parsedCommand.entities.targetLocationName && (
                                <div className="flex items-center gap-2 text-sm mb-4">
                                  <MapPin className="w-4 h-4 text-[#e59a3d]" />
                                  <span>{pendingCommand.parsedCommand.entities.targetLocationName}</span>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-[#e59a3d]"
                                  onClick={handleConfirm}
                                  disabled={isProcessing}
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4 mr-1" />
                                  )}
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                  disabled={isProcessing}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </Card>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* History */}
                    {history.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-sm">{item.promptText}</p>
                              {getStatusBadge(item.status)}
                            </div>
                            
                            {item.executionResult && (
                              <div className="mt-2 space-y-1">
                                <p className={`text-sm ${item.executionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                                  {item.executionResult.message}
                                </p>
                                {item.executionResult.changes.map((change, idx) => (
                                  <p key={idx} className="text-xs text-muted-foreground">
                                    • {change.description}
                                  </p>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    placeholder="Type a command... (e.g., 'Make John go to Starbucks')"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                    disabled={isProcessing}
                  />
                  <Button 
                    type="submit" 
                    disabled={isProcessing || !input.trim()}
                    className="bg-[#e59a3d]"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right Panel - History Sidebar */}
            <Card className="w-80 p-4 hidden xl:block">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-[#e59a3d]" />
                <h2 className="font-semibold">Recent Commands</h2>
              </div>
              
              <ScrollArea className="h-[calc(100%-40px)]">
                <div className="space-y-3">
                  {history.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-gray-50 text-sm"
                    >
                      <p className="font-medium truncate">{item.promptText}</p>
                      <div className="flex items-center justify-between mt-2">
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {history.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No commands yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
