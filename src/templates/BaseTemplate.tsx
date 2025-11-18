export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-bg-primary text-text-primary flex min-h-screen flex-col transition-colors">
      <header className="border-surface-border bg-bg-secondary border-b transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <nav aria-label="Main navigation">
              <ul className="flex items-center gap-x-8">
                {props.leftNav}
              </ul>
            </nav>

            <nav aria-label="Secondary navigation">
              <ul className="flex items-center gap-x-6">
                {props.rightNav}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{props.children}</main>
    </div>
  );
};
