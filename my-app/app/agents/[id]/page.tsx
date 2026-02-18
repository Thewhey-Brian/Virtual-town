import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { agents } from '@/lib/data';
import AgentDetailClient from './client';

// Generate static params for all agents
export function generateStaticParams() {
  return agents.map((agent) => ({
    id: agent.id,
  }));
}

// Generate metadata for each agent
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const agent = agents.find(a => a.id === params.id);
  if (!agent) {
    return { title: '居民未找到 - 虚拟小镇' };
  }
  return {
    title: `${agent.name} - 虚拟小镇`,
    description: agent.bio,
  };
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = agents.find(a => a.id === params.id);

  if (!agent) {
    notFound();
  }

  return <AgentDetailClient agent={agent} />;
}
