import "./globals.css";

export const metadata = {
  title: "Movie Review App",
  description: "แอปพลิเคชันรีวิวภาพยนตร์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}