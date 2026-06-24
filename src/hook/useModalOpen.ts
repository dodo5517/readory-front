import { useEffect } from 'react';

let openCount = 0;

export function useModalOpen(open: boolean) {
  useEffect(() => {
    if (!open) return;
    openCount += 1;
    document.body.classList.add('modal-open');
    return () => {
      openCount -= 1;
      if (openCount <= 0) {
        openCount = 0;
        document.body.classList.remove('modal-open');
      }
    };
  }, [open]);
}
