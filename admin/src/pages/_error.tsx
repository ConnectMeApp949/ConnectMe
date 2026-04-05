// Custom error page for the Pages Router fallback.
// Required to prevent the default _error page from using React hooks
// during static prerendering, which fails in npm workspace setups with
// multiple React copies.

function ErrorPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#6b7280' }}>Please try again later.</p>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = () => {
  return {};
};

export default ErrorPage;
