import { Sheet, SheetContent } from './ui/sheet';

const Cart = (props: any) => {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent
        style={{
          width: '400px',
          background: 'white',
          border: '4px solid purple',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          overflowY: 'auto',
        }}
      >
        {/* Cart Header */}
        <div style={{
          background: '#f3e8ff',
          color: '#7c3aed',
          fontWeight: 'bold',
          padding: '16px',
          borderBottom: '2px solid #7c3aed',
          textAlign: 'center',
          fontSize: '24px',
        }}>
          Your Cart
        </div>
        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {props.cartItems && props.cartItems.length > 0 ? (
            props.cartItems.map((item: any) => (
              <div key={item._id} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #eee',
                paddingBottom: '8px',
              }}>
                <img src={item.images?.[0] || ''} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ color: '#888' }}>Qty: {item.quantity}</div>
                  <div style={{ color: '#7c3aed', fontWeight: 'bold' }}>₹{item.price}</div>
                </div>
                <button onClick={() => props.onRemove(item._id)} style={{ marginLeft: 8, color: '#f43f5e', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
              </div>
            ))
          ) : (
            <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>Your cart is empty.</div>
          )}
        </div>
        {/* Cart Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #eee', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 12 }}>
            <span>Total</span>
            <span>₹{props.cartTotal || 0}</span>
          </div>
          <button
            style={{
              width: '100%',
              background: '#7c3aed',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 18,
              cursor: 'pointer',
            }}
            onClick={props.onCheckout}
            disabled={!props.cartItems || props.cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;