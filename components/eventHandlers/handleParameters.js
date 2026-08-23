import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useHandleParameters = () => {
  const router = useRouter();

  useEffect(() => {
    // Capture parameters from the URL
    const params = new URLSearchParams(window.location.search);
    const allowedKeys = ['problem', 'instance', 'solver', 'reduceTo', 'reductionType', 'verifier'];
    const data = {};

    params.forEach((value, key) => {
      if (allowedKeys.includes(key) && value !== "{{1,2,3},{1,2},GENERIC}") {
        data[key] = value ?? "";
      } else {
        console.warn(`Unexpected parameter: ${key}`);
      }
    });

    if (Object.keys(data).length > 0) {
      // localStorage.setItem('problemData', JSON.stringify(data));
    }

    // Remove parameters from the URL
    router.replace(window.location.pathname, undefined, { shallow: true });
    document.title = 'Redux';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally mount-only: URL params should be read and cleaned exactly once on load.
};