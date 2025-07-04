import { Sheet, SheetContent } from '@/components/ui/sheet';

const Cart = (props: any) => {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent className="flex flex-col w-full sm:w-96 border-4 border-purple-500 bg-white" style={{ zIndex: 999999 }}>
        <div className="flex flex-col w-full sm:w-96 border-4 border-purple-500 bg-white" style={{ zIndex: 999999 }}>
          <div style={{
            background: '#f3e8ff',
            color: '#7c3aed',
            fontWeight: 'bold',
            padding: '16px',
            borderBottom: '2px solid #7c3aed',
            textAlign: 'center',
            zIndex: 9999999,
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px'
          }}>
            SHEET ROOT TEST: If you see this, Sheet/SheetContent works globally.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;