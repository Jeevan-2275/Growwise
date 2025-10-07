
'use client';
import { useEffect, useRef, useState } from 'react';

export function useOnScreen<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return { ref, visible };
}