import React, { useState, useEffect } from 'react';
import { Snackbar, Button } from '@mui/material';

function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split(';').some(cookie => cookie.trim().startsWith('cookieConsent='));
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = "cookieConsent=true; path=/";
    setOpen(false);
  };

  const handleDecline = () => {
    document.cookie = "cookieConsent=false; path=/";
    setOpen(false);
  };

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

export default CookieConsent;