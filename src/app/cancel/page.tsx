export default function CancelPage() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>❌ Payment Canceled</h1>
      <p>You canceled the checkout process.</p>
      <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        Return to Home
      </a>
    </div>
  );
}
