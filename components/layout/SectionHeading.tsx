type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeading({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-slate-900">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}