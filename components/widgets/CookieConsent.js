import React, { useState, useEffect, useCallback } from 'react';
import { Snackbar, Button } from '@mui/material';
import { reduce } from 'd3';

const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const getCookieValue = (cookieName, key) => {
  const cookie = getCookie(cookieName);
  if (cookie) {
    try {
      const data = JSON.parse(cookie);
      return data[key] || null;
    } catch (error) {
      console.error("Error parsing JSON from cookie:", error);
      return null;
    }
  }
  return null;
};

function CookieConsent({ problem, solver, verifier, reducer }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = getCookie('cookieConsent');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = useCallback(() => {
    setCookie("cookieConsent", "true", 365);
    setOpen(false);
  }, []);

  const handleDecline = useCallback(() => {
    setCookie("cookieConsent", "false", 365);
    setOpen(false);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const consent = getCookie("cookieConsent");
      if (consent === "true") {
        const allData = {
          problem: problem.problemName ?? "",
          instance: problem.problemInstance ?? "",
          solver: solver.chosenSolver ?? "",
          reduceTo: reducer.chosenReduceTo ?? "",
          reductionType: reducer.chosenReductionType ?? "",
          verifier: verifier.chosenVerifier ?? "",
        };
        
        setCookie("allData", JSON.stringify(allData), 30);

      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [problem, solver, verifier, reducer]);

  return (
    <Snackbar
      open={open}
      message="This site uses cookies to enhance your experience. By continuing to browse, you accept our use of cookies."
      action={
        <>
          <Button color="secondary" size="small" onClick={handleDecline}>
            Decline
          </Button>
          <Button color="secondary" size="small" onClick={handleAccept}>
            Accept
          </Button>
        </>
      }
    />
  );
}

export { getCookie, getCookieValue };
export default CookieConsent;