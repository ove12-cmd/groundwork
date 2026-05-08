import BottomNav from "./BottomNav";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
      <div className="relative w-full max-w-[390px] min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
        <main className="flex-1 overflow-y-auto pb-[80px]">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
