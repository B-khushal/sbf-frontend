import { Sheet, SheetContent } from '@/components/ui/sheet';

const Cart = (props: any) => {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent className="flex flex-col w-full sm:w-96 border-4 border-blue-500 bg-white z-[9999]">
        <div style={{ background: '#e0f2ff', color: '#0369a1', fontWeight: 'bold', padding: '16px', borderBottom: '2px solid #0369a1', textAlign: 'center' }}>
          SHEET TEST: If you see this, Sheet/SheetContent is working.
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;