function ErrorBanner({ message }) {
  return (
    <div className="error-banner" role="alert">
      <strong>Request issue</strong>
      <p>{message}</p>
    </div>
  );
}

export default ErrorBanner;
