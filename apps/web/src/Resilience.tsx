import { Component, useEffect, useState, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <main className="route-boundary"><p className="eyebrow">Recovery boundary</p><h1>Something went wrong</h1><p>Your draft remains stored. Reset this view and try again.</p><button type="button" onClick={() => this.setState({ failed: false })}>Reset view</button></main>;
    return this.props.children;
  }
}

export function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const wentOnline = () => setOnline(true);
    const wentOffline = () => setOnline(false);
    window.addEventListener("online", wentOnline);
    window.addEventListener("offline", wentOffline);
    return () => {
      window.removeEventListener("online", wentOnline);
      window.removeEventListener("offline", wentOffline);
    };
  }, []);
  return online ? null : <div className="network-banner" role="status"><strong>You are offline.</strong> Draft edits stay local until the connection returns.</div>;
}
