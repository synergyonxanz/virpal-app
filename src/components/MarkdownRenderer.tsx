/**
 * VirPal App - AI Assistant with Azure Functions
 * Copyright (c) 2025 Achmad Reihan Alfaiz. All rights reserved.
 *
 * This file is part of VirPal App, a proprietary software application.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This source code is the exclusive property of Achmad Reihan Alfaiz.
 * No part of this software may be reproduced, distributed, or transmitted
 * in any form or by any means, including photocopying, recording, or other
 * electronic or mechanical methods, without the prior written permission
 * of the copyright holder, except in the case of brief quotations embodied
 * in critical reviews and certain other noncommercial uses permitted by
 * copyright law.
 *
 * For licensing inquiries: reihan3000@gmail.com
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'chat' | 'default';
}

/**
 * MarkdownRenderer Component
 *
 * Komponen reusable untuk render markdown dengan styling yang konsisten
 * dengan tema VirPal. Mendukung GitHub Flavored Markdown dan syntax highlighting.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  variant = 'default',
}) => {
  const baseClasses = 'markdown-content theme-transition';
  const variantClasses =
    variant === 'chat' ? 'markdown-chat' : 'markdown-default';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling untuk heading
          h1: ({ children }) => (
            <h1
              className="text-xl font-bold mb-3 theme-transition"
              style={{ color: 'var(--virpal-primary)' }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="text-lg font-semibold mb-2 theme-transition"
              style={{ color: 'var(--virpal-primary)' }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-base font-medium mb-2 theme-transition"
              style={{ color: 'var(--virpal-primary)' }}
            >
              {children}
            </h3>
          ),

          // Custom styling untuk emphasis
          strong: ({ children }) => (
            <strong
              className="font-semibold theme-transition"
              style={{ color: 'var(--virpal-primary)' }}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em
              className="italic theme-transition"
              style={{ color: 'var(--virpal-secondary)' }}
            >
              {children}
            </em>
          ),

          // Custom styling untuk lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-2 space-y-1 theme-transition">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-2 space-y-1 theme-transition">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className="text-sm leading-relaxed theme-transition"
              style={{ color: 'var(--virpal-neutral-default)' }}
            >
              {children}
            </li>
          ),

          // Custom styling untuk blockquotes
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-4 pl-4 my-3 italic theme-transition"
              style={{
                borderColor: 'var(--virpal-accent)',
                backgroundColor: 'var(--virpal-accent)',
                color: 'var(--virpal-neutral-default)',
              }}
            >
              {children}
            </blockquote>
          ), // Custom styling untuk code
          code: ({ node, inline, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1 py-0.5 rounded text-xs font-mono theme-transition"
                  style={{
                    backgroundColor: 'var(--virpal-accent)',
                    color: 'var(--virpal-primary)',
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="block p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 theme-transition"
                style={{
                  backgroundColor: 'var(--virpal-neutral-lighter)',
                  color: 'var(--virpal-neutral-default)',
                }}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Custom styling untuk links
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="underline transition-colors theme-transition hover:opacity-80"
              style={{ color: 'var(--virpal-secondary)' }}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),

          // Custom styling untuk horizontal rules
          hr: () => (
            <hr
              className="my-4 border-t theme-transition"
              style={{ borderColor: 'var(--virpal-neutral-lighter)' }}
            />
          ),

          // Custom styling untuk paragraphs
          p: ({ children }) => (
            <p
              className="mb-2 leading-relaxed theme-transition"
              style={{ color: 'var(--virpal-neutral-default)' }}
            >
              {children}
            </p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
