export default function LabelChip({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 bg-primary-container text-primary text-xs rounded-full">
      {label}
    </span>
  );
}
