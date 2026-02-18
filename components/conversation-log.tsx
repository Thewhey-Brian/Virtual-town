'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, MapPin, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conversation } from '@/lib/types';
import { mockConversations, getAgentById, getLocationById } from '@/lib/data';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ConversationLogProps {
  agentId?: string;
}

export function ConversationLog({ agentId }: ConversationLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedConv, setExpandedConv] = useState<string | null>(null);

  let conversations = agentId
    ? mockConversations.filter(c => c.participants.includes(agentId))
    : mockConversations;

  if (searchQuery) {
    conversations = conversations.filter(c => 
      c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.topic?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索对话内容..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white/50"
        />
      </div>

      {/* Conversations */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {conversations.map((conversation, index) => {
              const location = getLocationById(conversation.location);
              const isExpanded = expandedConv === conversation.id;

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => setExpandedConv(isExpanded ? null : conversation.id)}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CollapsibleTrigger asChild>
                        <div className="p-4 cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f9e8d0] to-[#f4d4a7] flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-[#d97f28]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm">
                                    {conversation.topic || '对话记录'}
                                  </h4>
                                  {conversation.participants.length > 2 && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      {conversation.participants.length}人
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {location.name}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(conversation.startedAt, 'MM月dd日 HH:mm')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          {/* Participants */}
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-muted-foreground">参与者:</span>
                            <div className="flex -space-x-2">
                              {conversation.participants.map(participantId => {
                                const agent = getAgentById(participantId);
                                return agent ? (
                                  <div
                                    key={participantId}
                                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
                                    title={agent.name}
                                  >
                                    <img
                                      src={agent.avatar}
                                      alt={agent.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>

                          {/* Preview of last message */}
                          {!isExpanded && conversation.messages.length > 0 && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-1">
                              <span className="font-medium text-foreground">
                                {getAgentById(conversation.messages[conversation.messages.length - 1].senderId)?.name}:
                              </span>{' '}
                              {conversation.messages[conversation.messages.length - 1].content}
                            </p>
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 border-t border-dashed pt-3">
                          <div className="space-y-3">
                            {conversation.messages.map((message, msgIndex) => {
                              const sender = getAgentById(message.senderId);
                              const isFirstInGroup = msgIndex === 0 || 
                                conversation.messages[msgIndex - 1].senderId !== message.senderId;

                              return (
                                <div key={message.id} className="flex gap-3">
                                  {isFirstInGroup ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      <img
                                        src={sender?.avatar}
                                        alt={sender?.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 flex-shrink-0" />
                                  )}
                                  <div className="flex-1">
                                    {isFirstInGroup && (
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-foreground">
                                          {sender?.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          {format(message.timestamp, 'HH:mm')}
                                        </span>
                                      </div>
                                    )}
                                    <div className="bg-[#fdf6ed] rounded-2xl rounded-tl-sm px-3 py-2 inline-block">
                                      <p className="text-sm text-foreground">{message.content}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {conversations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fdf6ed] flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#e59a3d]" />
              </div>
              <p className="text-muted-foreground">暂无对话记录</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
