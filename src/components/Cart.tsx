const Cart = (props: any) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: 'white',
      border: '4px solid orange',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1.2rem'
    }}>
      ABSOLUTE MINIMAL CART: If you see this, React is working. If not, the issue is with the parent or provider.
    </div>
  );
};

export default Cart;