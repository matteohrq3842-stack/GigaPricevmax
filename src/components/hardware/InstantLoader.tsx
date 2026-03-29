'use client';

import { ReactNode } from 'react';

export default function InstantLoader(props: {
  children: ReactNode;
  isLoading?: boolean;
  subtitleText?: string;
}) {
  return props.children;
}
