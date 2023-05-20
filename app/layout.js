import "./styles/globals.css";


export const metadata = {
  title: "WispChat",
  description: "Online realtime messaging",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
