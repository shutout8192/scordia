interface Props {
  title: string;
  description: string;
  linkText: string;
  href: string;
}

export default function AffiliateCard({ title, description, linkText, href }: Props) {
  return (
    <div className="bg-white rounded-xl border-2 border-border p-5 hover:border-primary/30 transition-colors">
      <h3 className="font-bold mb-1 text-sm">{title}</h3>
      <p className="text-foreground/60 text-xs mb-3">{description}</p>
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="text-primary text-sm font-medium hover:underline"
      >
        {linkText} &rarr;
      </a>
    </div>
  );
}
