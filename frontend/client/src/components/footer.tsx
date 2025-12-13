export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="h-12 border-t bg-background shrink-0">
      <div className="h-full flex items-center justify-center px-6 text-sm text-muted-foreground">
        <p>&copy; {currentYear} Drawer. All rights reserved.</p>
      </div>
    </footer>
  );
}
