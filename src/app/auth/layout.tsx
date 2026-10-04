export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {children}
    </div>
  );
}
