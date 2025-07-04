import { Sheet, SheetContent } from '@/components/ui/sheet';

const Cart = (props: any) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        background: 'white',
        border: '4px solid purple',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#f3e8ff',
          color: '#7c3aed',
          fontWeight: 'bold',
          padding: '16px',
          borderBottom: '2px solid #7c3aed',
          textAlign: 'center',
          fontSize: '32px',
        }}
      >
        SHEET ROOT TEST: If you see this, Sheet/SheetContent works globally.
      </div>
    </div>
  );
};

export default Cart;