'use client';

import { useEffect } from 'react';
import { captureLeadAttribution } from '@/lib/leadAttribution';

export default function LeadAttributionCapture() {
  useEffect(() => { captureLeadAttribution(); }, []);
  return null;
}
