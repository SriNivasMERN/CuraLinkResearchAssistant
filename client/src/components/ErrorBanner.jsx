function ErrorBanner({ message }) {
  return (
    <div className="error-banner" role="alert">
      {message}
    </div>
  );
}

export default ErrorBanner;

