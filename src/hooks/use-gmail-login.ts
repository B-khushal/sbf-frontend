import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useGmailLogin = () => {
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const auth = useContext(AuthContext);

  const openGmailDialog = useCallback(() => {
    setIsGmailDialogOpen(true);
  }, []);

  const closeGmailDialog = useCallback(() => {
    setIsGmailDialogOpen(false);
  }, []);

  const handleGmailLogin = useCallback(async () => {
    try {
      if (!auth) return;
      
      const success = await auth.socialLogin('google');
      
      if (success) {
        closeGmailDialog();
      }
    } catch (error) {
      console.error('Gmail login error:', error);
    }
  }, [auth, closeGmailDialog]);

  return {
    isGmailDialogOpen,
    openGmailDialog,
    closeGmailDialog,
    handleGmailLogin,
  };
}; 