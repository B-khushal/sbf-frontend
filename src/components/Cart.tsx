import { Sheet, SheetContent } from '@/components/ui/sheet';

const Cart = (props: any) => {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent className="flex flex-col w-full sm:w-96 border-4 border-green-500 bg-white z-[9999]">
        <div style={{ background: '#e0ffe0', color: '#065f46', fontWeight: 'bold', padding: '16px', borderBottom: '2px solid #065f46', textAlign: 'center' }}>
          MINIMAL CART: If you see this, the Cart component is rendering fine. If not, the issue is with context/hooks.
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;